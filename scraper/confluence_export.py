import getpass
import jinja2
import json
import os
import requests
import shutil
from xmlrpc import client
import yaml
import traceback
from jinja2 import Environment, FileSystemLoader
from typing import Dict, List
from mongo_client import MongoClientWrapper
from time import sleep


SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__))
ROOT_DIR = os.path.dirname(SCRIPT_DIR) + '/'

# Changes to the appropriate directory before executing the script.
os.chdir(SCRIPT_DIR)

JINJA_ENV = Environment(
    loader=FileSystemLoader('.'),
    autoescape=jinja2.select_autoescape(['html', 'xml'])
)


def print_json(json_dict: Dict, label: str=None) -> None:
    """
    Pretty prints a python dictionary object

    :param json_dict:
    :param label:
    :return:
    """
    if label:
        print("======== %s ========" % label)

    try:
        print(json.dumps(json_dict, sort_keys=True, indent=4))
    except TypeError as e:
        print(json_dict)

    if label:
        print("======== %s ========" % label)


def read_yaml(path: str) -> Dict:
    """
    Reads in the yaml configuration files and coverts them into python dict opbjects

    :param path: The path to the yaml i

    :return: None
    """ 
    with open(path, 'r') as stream:
        return yaml.load(stream)


def is_ascii(s: int):
    return all(ord(c) < 128 for c in s)


class NotFoundError(Exception):
    pass


class NavigationGenerator:

    def __init__(self, space_config: Dict, mongo_wrapper: MongoClientWrapper, server: client.ServerProxy, token):
        """
        Initializes the NavigationGenerator class

        :param space_config: The configuration for a specified confluence space.
        :param mongo_wrapper: The wrapper for a mongo client connection.
        """
        self._nav_tree = []
        self._mongo_wrapper = mongo_wrapper
        self._space_config = space_config
        self._server = server
        self._token = token

    @property
    def nav_tree():
        return self._nav_tree

    def _append_children(self, page_to_append: Dict):
        """
        Recursive function that appends children elements
        for each page.
        
        :param page_to_append: The page dictionary object.

        :return: None
        """        
        page_id = page_to_append["id"]
        children = self._server.confluence2.getChildren(self._token, page_id)
        sleep(self._space_config['sleep_export'])
        page_to_append['children'] = []
        for child in children:
            #if child['parentId'] == page_id:
            my_child = {'title': child["title"],
                        'parentId': child['parentId'],
                        'id': child['id']}
            print("Appending" + child["title"])
            page_to_append['children'].append(my_child)
            self._append_children(my_child)

    def build_tree(self, pages: List, space_id: str):
        """
        Appends the top level pages the the nav_tree python list.

        :param pages: A python list of dictionary objects returned from the confluence API.
        :param space_id: The id of the CVACH home space.
        """
        for page in pages:
            if space_id == page['parentId']:
                page_id = page["id"]
                root_page = {'title': page["title"], 'parentId': page['parentId'], 'id': page_id}
                self._nav_tree.append(root_page)
                self._append_children(root_page)
        
        self._mongo_wrapper.insert_tree(self._space_config['space_name'], self._nav_tree)


class HtmlGenerator:
    """
    A class that generates the HTML files for offline confluence documentation.
    """

    def __init__(self, space_config: Dict, username: str, password: str, mongo_wrapper: MongoClientWrapper):
        """
        Initializes the HTML Generation class.

        :param space_config:
        :param username:
        :param password:
        :param mongo_wrapper:
        """
        self._username = username
        self._password = password
        self._space_config = space_config
        self._server = client.ServerProxy(self._space_config['site'] + '/rpc/xmlrpc')
        self._token = self._server.confluence2.login(self._username,
                                                     self._password)
                
        self._confluence_images_dir = self._space_config['confluence_images_dir']
        self._confluence_attachments_dir = self._space_config['confluence_attachments_dir']

        self._nav_generator = NavigationGenerator(self._space_config, mongo_wrapper, self._server, self._token)
        self._mongo_wrapper = mongo_wrapper

    def _reset_confluence_dirs(self):
        """
        Deletes and recreates the confluence images directory.

        :return: None
        """
        confluence_dirs = [self._confluence_attachments_dir, self._confluence_images_dir]
        for conf_dir in confluence_dirs:
            if os.path.exists(conf_dir) and os.path.isdir(conf_dir):
                shutil.rmtree(conf_dir)
            os.makedirs(conf_dir)

    def _get_space_id(self, pages):
        """
        Finds the top level parent page for the space.

        :param pages: A python list of dictionary objects returned from the confluence API.
        :return: None
        """
        for page in pages:
            if page['parentId'] == 0 or page['parentId'] == '0':
                return page['id']
        raise NotFoundError()

    def _clear_tags(self, page_dict: Dict, tag_name: str, clear_content=False):
        """
        Clears all tags with a specified name in the page_dict content.
        It is important to note that it clears both the tag and the tag's contents.

        :param page_dict: A python dictionary returned from the confluence API. EX:
        :param tag_name:  A tagname without its angle brakets. EX: 'ac:test' would 
                          clear all <ac:test>contents</ac:test>
        :param clear_content: If set to true will clear the tags contents, by default,
                        it will only remove the tags and keep the content
        :return: None
        """
        begin_tag = '<' + tag_name
        end_tag = '</' + tag_name + '>'
        while True:
            try:
                if clear_content:
                    begin_pos = page_dict['content'].index(begin_tag)
                    end_pos = page_dict['content'].index(end_tag, begin_pos) + len(end_tag)
                    page_dict['content'] = page_dict['content'][0:begin_pos] + page_dict['content'][end_pos:]
                else:
                    begin_pos_start_tag = page_dict['content'].index(begin_tag)
                    end_pos_start_tag = page_dict['content'].index('>', begin_pos_start_tag) + 1

                    page_dict['content'] = page_dict['content'][0:begin_pos_start_tag] + page_dict['content'][end_pos_start_tag:]
                    begin_pos_end_tag = page_dict['content'].index(end_tag, begin_pos_start_tag) 
                    end_pos_end_tag = begin_pos_end_tag + len(end_tag)
                    page_dict['content'] = page_dict['content'][0:begin_pos_end_tag] + page_dict['content'][end_pos_end_tag:]                
            except ValueError:
                return

    def _replace_plain_text_body(self, page_dict: Dict):
        """
        Replaces plain-text-body tags with our defined code bock tags.

        :param page_dict: A python dictionary returned from the confluence API.
        :return: None
        """
        start_tag = '<ac:plain-text-body>'
        end_tag = '</ac:plain-text-body>'
        page_dict['content'] = page_dict['content'].replace('<![CDATA[---', '')
        page_dict['content'] = page_dict['content'].replace(']]>', '')
        page_dict['content'] = page_dict['content'].replace('<![CDATA[', '')        
        page_dict['content'] = page_dict['content'].replace(start_tag, '<pre><code>')
        page_dict['content'] = page_dict['content'].replace(end_tag, '</pre></code>')        

    def _replace_image_tag(self, page_dict: Dict, image_name: str):
        """
        Replaces the <ac:image tag with an appropriate img source tag.

        :param page_dict: A python dictionary returned from the confluence API. EX:

        {'content': '<p><br /></p>', 'title': 'Building  the MIP from Scratch', 
        'url': 'https://confluence.di2e.net/display/THISISCVAH/Building++the+MIP+from+Scratch', 
        'creator': 'grant.curell', 'space': 'THISISCVAH', 'modified': <DateTime '20180716T14:40:15' at 7fd619335170>, 
        'created': <DateTime '20180716T14:40:15' at 7fd6193351b8>, 'current': 'true', 'version': '1', 
        'parentId': '274138076', 'contentStatus': 'current', 'modifier': 'grant.curell', 
        'homePage': 'false', 'id': '274139688', 'permissions': '0'}

        :param image_name: The image we are searching for.        
        :return: None
        """        
        replacement_tag = '<img src="' + self._space_config['confluence_images_url_path'] + image_name + '">'
        return self._replace_tag(page_dict, image_name, replacement_tag)
    
    def _replace_attachement_tag(self, page_dict: Dict, attachment_name: str):
        """
        Replaces the <ac:attachment tag with an appropriate href tag.

        :param page_dict: A python dictionary returned from the confluence API.
        :param attachment_name: The name of the attachment
        :return:
        """
        replacement_tag = ('<a href="' + self._space_config['confluence_attachments_url_path']
                           + attachment_name + '">Click to download ' + attachment_name + '</a>')
        return self._replace_tag(page_dict, attachment_name, replacement_tag)

    def _replace_tag(self, page_dict, attachment_name, replacement_tag):
        """
        Replaces the <ac:image tag with an appropriate img source tag.

        :param page_dict: A python dictionary returned from the confluence API. EX:
        :param attachement_name: The image or attachement we are searching for.        
        :param start_of_tag: The start of the tag
        :param end_of_tag: The end of the tag
        :return: None
        """
        pos = page_dict['content'].find(attachment_name)
        if pos == -1:
            print("Failed to find String: {} in page content: {}.".format(attachment_name, page_dict['title']))
            return False

        try:
            image_start_pos = page_dict['content'].rindex('<', 0, pos)
            image_end_pos = page_dict['content'].index('>', pos) + 1

            page_dict['content'] = page_dict['content'][0:image_start_pos] + replacement_tag + page_dict['content'][image_end_pos:]
            return True
        except ValueError as e:
            offset = 100
            print("=======================================================")
            print("Failed to replace tag for {} on page {}".format(attachment_name, page_dict['title']))
            print("After pos: " + page_dict['content'][pos:pos + offset])
            if pos >= offset:
                print("Before pos: " + page_dict['content'][pos-offset:pos])
            else:
                print("Before pos: " + page_dict['content'][0:pos])
            print("=======================================================")
        return False

    def _download_attachment(self, attachment: Dict):
        """
        Downloads the passed in attachment
        :param attachement Dictionary: {'comment': '', 'contentType': 'image/png', 'title': 'image2018-6-21_15-4-42.png', 
        'url': 'https://...', 'creator': 'some.name', 'fileName': 'image2018-6-21_15-4-42.png',         
        'created': <DateTime '20180621T20:04:43' at 7fabc9a83368>, 'fileSize': '3278', 'pageId': '255791704', 'id': '266768923'}

        :return: None
        """
        response = requests.get(attachment['url'], stream=True, auth=(self._username, self._password))
        print("Filename: {} Http_code: {}".format(attachment['fileName'], str(response.status_code)))
        if response.status_code == 200:
            file_path = ""
            if attachment['contentType'] == 'image/png' or attachment['contentType'] == 'image/jpeg':
                file_path = self._confluence_images_dir + attachment['fileName']
            else:
                file_path = self._confluence_attachments_dir + attachment['fileName']

            if not os.path.exists(file_path):
                with open(file_path, 'wb') as fhandle:
                    for chunk in response.iter_content(1024):
                        fhandle.write(chunk)                    

    def execute(self) -> None:
        """
        Executes the html generation process.
        :return:
        """
        if self._space_config['download_attachments']:
            self._reset_confluence_dirs()

        pages = self._server.confluence2.getPages(self._token, self._space_config['space_name'])
        for page in pages:
            sleep(self._space_config['sleep_export'])
            page_id = page['id']
            page_dict = self._server.confluence2.getPage(self._token, page_id)
            page_dict["_id"] = page_dict["id"]
            del page_dict["id"]
            del page_dict['created']
            del page_dict['modified']

            self._replace_plain_text_body(page_dict)
            page_attachments = self._server.confluence2.getAttachments(self._token, page_id)
            for attachment in page_attachments:
                print_json(attachment)
                try:
                    if attachment['contentType'] == 'image/png' or attachment['contentType'] == 'image/jpeg':
                        if self._replace_image_tag(page_dict, attachment["fileName"]):
                            if self._space_config['download_attachments']:
                                self._download_attachment(attachment)
                                sleep(self._space_config['sleep_export'])
                    else:
                        if self._replace_attachement_tag(page_dict, attachment["fileName"]):
                            if self._space_config['download_attachments']:
                                self._download_attachment(attachment)
                                sleep(self._space_config['sleep_export'])
                except KeyError as e:
                    print("Attachment type {} is not supoorted".format(attachment['contentType']))
                except Exception as e:
                    print("Unknown attachment failure" + str(e))
                    traceback.print_exc()
                
            if self._space_config['clear_parameter_tags']:
                self._clear_tags(page_dict, 'ac:parameter')
                self._clear_tags(page_dict, 'ac:structured-macro')

            print("Saving " + page_dict["title"])
            self._mongo_wrapper.insert_page(page_dict)
        
        space_id = self._get_space_id(pages)
        self._nav_generator.build_tree(pages, space_id)
    
    def execute2(self):
        url = self._server.confluence2.exportSpace(self._token, self._space_config['space_name'], "TYPE_HTML")
        print(url)
        response = requests.get(url, stream=True, auth=(self._username, self._password))
        if response.status_code == 200:
            file_path = '/root/space.zip'
            with open(file_path, 'wb') as fhandle:
                for chunk in response.iter_content(1024):
                    fhandle.write(chunk)

    def execute3(self):
        pages = self._server.confluence2.getPages(self._token, self._space_config['space_name'])
        space_id = self._get_space_id(pages)
        self._nav_generator.build_tree2(pages, space_id)

    def get_spaces(self):
        spaces = self._server.confluence2.getSpaces(self._token)
        for space in spaces:
            print(space)


def prompt_username() -> str:
    """
    Prompts for username
    :return:
    """
    username = input("Please enter your username: ")    
    return username


def prompt_password() -> str:
    """
    Prompts for password
    :return:
    """
    password = getpass.getpass("Please enter your password: ")
    return password


def main():
    scrapper_config = read_yaml('scraper_config.yml')
    if not scrapper_config.get('username'):
        username = prompt_username()
    else:
        username = scrapper_config.get('username')

    if not scrapper_config.get('password'):
        password = prompt_password()
    else:
        password = scrapper_config.get('password')

    with MongoClientWrapper() as mongoc:
        for space_config in scrapper_config['confluence_spaces']:
            mongoc.set_collection_names(space_config['space_name'])
            html_gen = HtmlGenerator(space_config, username, password, mongoc)
            html_gen.execute()


if __name__ == "__main__":
    main()
