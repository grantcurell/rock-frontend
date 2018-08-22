import copy
import getpass
import jinja2
import json
import os
import requests
import shutil
import xmlrpclib
import yaml
import traceback
from jinja2 import Environment, FileSystemLoader


SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__))
ROOT_DIR = os.path.dirname(SCRIPT_DIR) + '/'

# Changes to the appropriate directory before executing the script.
os.chdir(SCRIPT_DIR)

JINJA_ENV = Environment(
    loader=FileSystemLoader('.'),
    autoescape=jinja2.select_autoescape(['html', 'xml'])
)


def read_yaml(path):
    """
    Reads in the leftnavbar layout configuration file so that we can 
    dictate navbar layout.

    :return: None
    """ 
    with open(path, 'r') as stream:
        return yaml.load(stream)

def is_ascii(s):
    return all(ord(c) < 128 for c in s)


def get_foldername(path):
    normalized_path = os.path.dirname(path)
    pos = normalized_path.rfind('/') + 1
    return normalized_path[pos:]    


class NotFoundError(Exception):
    pass


def gen_topnavbar(thisiscvah_url="/THISISCVAH/THISISCVAH_1_tfplenum_system_design", 
                  jcctm_url="/OJCCTM/OJCCTM_u_capability_catalogue_softwareortools_uororfouo"):
        """
        Renders the object for top navigation bar.

        :return: None
        """        
        template = JINJA_ENV.get_template("topnavbar.template")
        navbar_template = template.render(thisiscvah_url=thisiscvah_url, jcctm_url=jcctm_url)
        with open("../app/navbar_elements.py", "w") as navbar_file:
            navbar_file.write(navbar_template.encode('utf-8'))


class NavigationGenerator:

    def __init__(self, space_config):
        self._leftnavbar_template = "leftnavbar.template"
        self._leftnavbar_html_path = space_config['confluence_templates_dir'] + "leftnavbar.html"
        self._nav_tree = []
        try: 
            self._nav_template_layout = read_yaml(space_config['sorter'])
        except KeyError:
            print("Defaulting to alphanumeric sorter.")
            self._nav_template_layout = None

    @property
    def nav_tree():
        return self._nav_tree

    def _get_sort_by(self, layout, page_title):
        """
        Recursive method that returns the appropriate list to sort against
        for the navigation bar.

        :param layout: A python list layout
        :param page_title: The title we are trying to match against.
        """
        for item in layout:            
            if item['title'] == page_title:                
                try:                                 
                    return item['children']
                except KeyError as e:                    
                    return None
            elif item.get('children'):
                ret_val = self._get_sort_by(item['children'], page_title)
                if ret_val:
                    return ret_val

    def _append_children(self, pages, page_to_append):
        """
        Recursive function that appends children elements
        for each page.

        :return: None
        """
        page_to_append['children'] = []
        for page in pages:
            if page['parentId'] == page_to_append['id']:
                page_to_append['children'].append(page)
                self._append_children(pages, page)
        
        if self._nav_template_layout:
            sort_by = self._get_sort_by(self._nav_template_layout, page_to_append['title'])
            self.sort_nav_tree(page_to_append['children'], sort_by)
        else:
            page_to_append['children'] = sorted(page_to_append['children'], key=lambda k: k['title'])

    def build_tree(self, pages, space_id):
        """
        Appends the top level pages the the nav_tree python list.

        :param pages: A python list of dictionary objects returned from the confluence API.
        :param space_id: The id of the CVACH home space.
        """
        for page in pages:
            if space_id == page['parentId']:
                self._nav_tree.append(page)
                self._append_children(pages, page)

        if self._nav_template_layout:
            self.sort_nav_tree(self._nav_tree, self._nav_template_layout)
        else:
            self._nav_tree = sorted(self._nav_tree, key=lambda k: k['title'])

    def gen_leftnavbar(self):
        """
        Renders the python left navigation bar.
        
        :return: None
        """
        template = JINJA_ENV.get_template(self._leftnavbar_template)
        navbar_template = template.render(page_tree=self._nav_tree)
        with open(self._leftnavbar_html_path, "w") as navbar_file:
            navbar_file.write(navbar_template.encode('utf-8'))

        return self._nav_tree[0]    

    def _find_index(self, nav_tree, title_to_look_for):
        """
        Returns the index of the page tree element we are looking for.

        :param nav_tree: A python list of page objects that contain the title we are searching for.
        :param title_to_look_for: A python string title we are looking for.
        """
        for index, page in enumerate(nav_tree):
            if page['title'] == title_to_look_for:
                return index
        print(nav_tree)
        raise NotFoundError('Failed to find ' + title_to_look_for)

    def sort_nav_tree(self, nav_tree, sort_by):
        """
        Sorts a python list based on the title.

        :param nav_tree: A python list[{'title':'sometitle'}] we wish to have sorted a certain way
        :param sort_by: A python list['sometitle'] containing the desired state.
        """
        if sort_by is None:
            return

        for index, item in enumerate(sort_by):
            try:
                found_index = self._find_index(nav_tree, item['title'])
            except NotFoundError as e:
                print(str(e))
                continue
            item = nav_tree.pop(found_index)
            nav_tree.insert(index, item)
            

class HtmlGenerator:
    """
    A class that generates the HTML files for offline confluence documentation.
    """

    def __init__(self, space_config, username, password):
        """
        Initializes the HTML Generation class.
        """
        self._username = username
        self._password = password
        self._space_config = space_config
        self._server = xmlrpclib.ServerProxy(self._space_config['site'] + '/rpc/xmlrpc')
        self._token = self._server.confluence2.login(self._username,
                                                     self._password)
                
        self._confluence_images_dir = "../app" + self._space_config['confluence_images_url_path']
        self._view_template = "confluence_views.template"
        self._nav_generator = NavigationGenerator(self._space_config)
        self._templates_folder = get_foldername(self._space_config['confluence_templates_dir'])        

    def _to_filename(self, space_name, title_str):
        """
        Replaces all spaces in the string with underscores and make everything lowercase.
        Also removes all special characters from title_str except for the underscore.

        :param title_str:
        :return: None
        """
        special_chars = "`-=[]\;',.~!#$%^&*()+{}|:\"<>?"        
        ret_val = title_str.lower().replace(" ", "_").replace("/", "or").replace("&", "and")
        for special_char in special_chars:
            ret_val = ret_val.replace(special_char, "")

        try:
            ret_val.decode('ascii')
        except (UnicodeDecodeError, UnicodeEncodeError) as e:
            return ''.join([i if ord(i) < 128 else '' for i in ret_val])
            
        return space_name + '_' + ret_val

    def _reset_confluence_template_dir(self):
        """
        Deletes and recreates the confluence template directory.

        :return: None
        """
        if os.path.exists(self._space_config['confluence_templates_dir']) and os.path.isdir(self._space_config['confluence_templates_dir']):
            shutil.rmtree(self._space_config['confluence_templates_dir'])
        os.makedirs(self._space_config['confluence_templates_dir'])

    def _reset_confluence_images_dir(self):
        """
        Deletes and recreates the confluence images directory.

        :return: None
        """
        if os.path.exists(self._confluence_images_dir) and os.path.isdir(self._confluence_images_dir):
            shutil.rmtree(self._confluence_images_dir)
        os.makedirs(self._confluence_images_dir)        

    def _gen_html_file(self, file_path, page_dict):
        """
        Method generates a confluence HTML file.

        :param file_path: The file path to be created.
        :param page_dict: A python dictionary returned from the confluence API.
        :return: None
        """
        with open(file_path, "w") as html_handle:
            html_handle.write('{% extends "base.html" %}\n')
            html_handle.write('{% block title %}' + page_dict["title"].encode('utf-8') + '{% endblock %}\n')
            html_handle.write('{% block navbar %}\n')
            html_handle.write('{% include "navbar.html" %}\n')
            html_handle.write('{% endblock %}\n')
            html_handle.write('{% block body %}\n')
            html_handle.write('<div class="container-fluid" style="margin-top: 60px;">\n')
            html_handle.write('    <div class="row">\n')
            html_handle.write('        <div class="col-3" style="padding: 0px;">\n')
            html_handle.write('            <div class="leftnav-wrapper">\n')
            html_handle.write('{% include "' + self._templates_folder + '/leftnavbar.html" %}\n')
            html_handle.write('            </div>\n')
            html_handle.write('        </div>\n')
            html_handle.write('        <div class="col-9 card confluence" style="overflow-x: auto;">\n')
            html_handle.write('<h1>' + page_dict["title"].encode('utf-8') + '</h1>\n')
            html_handle.write(page_dict['content'].encode('utf8'))
            html_handle.write('\n        </div>\n')
            html_handle.write('    </div>\n')
            html_handle.write('</div>\n')
            html_handle.write('<script type=text/javascript src="{{ url_for(\'static\', filename=\'bootstrap/js/confluence.js\') }}"></script>\n')            
            html_handle.write('\n{% endblock %}\n')

    def _gen_python_views_file(self, pages):
        """
        Renders the python flask controller file.

        :param pages: A python list of dictionary objects returned from the confluence API
        :return: None
        """        
        template = JINJA_ENV.get_template(self._view_template)
        views_template = template.render(pages=pages, templates_folder=self._templates_folder)
        with open(self._space_config['confluence_views'], "w") as views_file:
            views_file.write(views_template.encode('utf-8'))

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

    def _clear_tags(self, page_dict, tag_name, clear_content=False):
        """
        Clears all tags with a specified name in the page_dict content.
        It is important to note that it clears both the tag and the tag's contents.

        :param page_dict: A python dictionary returned from the confluence API. EX:
        :param tag_name:  A tagname without its angle brakets. EX: 'ac:test' would 
                          clear all <ac:test>contents</ac:test>
        :clear_content: If set to true will clear the tags contents, by default, 
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

    def _replace_plain_text_body(self, page_dict):
        """
        Replaces plain-text-body tags with our defined code bock tags.

        :param page_dict: A python dictionary returned from the confluence API. EX:
        :return: None
        """
        start_tag = '<ac:plain-text-body>'
        end_tag = '</ac:plain-text-body>'
        page_dict['content'] = page_dict['content'].replace('<![CDATA[---', '')
        page_dict['content'] = page_dict['content'].replace(']]>', '')
        page_dict['content'] = page_dict['content'].replace('<![CDATA[', '')        
        page_dict['content'] = page_dict['content'].replace(start_tag, '<pre><code>')
        page_dict['content'] = page_dict['content'].replace(end_tag, '</pre></code>')        

    def _replace_image_tag(self, page_dict, image_name):
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
    
    def _replace_attachement_tag(self, page_dict, attachment_name):
        replacement_tag = '<a href="' + self._space_config['confluence_images_url_path'] + attachment_name + '">Click to download ' + attachment_name + '</a>'
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

    def _download_attachment(self, attachment):
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
            file_path = self._confluence_images_dir + attachment['fileName']
            if not os.path.exists(file_path):
                with open(file_path, 'wb') as fhandle:
                    for chunk in response.iter_content(1024):
                        fhandle.write(chunk)                    

    def execute(self):
        """
        Executes the html generation process.
        :return:
        """
        self._reset_confluence_template_dir()
        if self._space_config['download_attachments']:
           self._reset_confluence_images_dir()

        pages = []
        for page in self._server.confluence2.getPages(self._token, self._space_config['space_name']):
            page_id = page['id']
            page_dict = self._server.confluence2.getPage(self._token, page_id)
            
            self._replace_plain_text_body(page_dict)
            page_attachments = self._server.confluence2.getAttachments(self._token, page_id)
            for attachment in page_attachments:
                try:
                    if attachment['contentType'] == 'image/png' or attachment['contentType'] == 'image/jpeg':
                        if self._replace_image_tag(page_dict, attachment["fileName"]):
                            if self._space_config['download_attachments']:
                                self._download_attachment(attachment)
                    else:
                        if self._replace_attachement_tag(page_dict, attachment["fileName"]):
                            if self._space_config['download_attachments']:
                                self._download_attachment(attachment)
                except KeyError as e:
                    print("Attachment type {} is not supoorted".format(attachment['contentType']))
                except Exception as e:
                    print("Unknown attachement failure" + str(e))
                    traceback.print_exc()                    
                
            if self._space_config['clear_parameter_tags']:
                self._clear_tags(page_dict, 'ac:parameter')
                self._clear_tags(page_dict, 'ac:structured-macro')

            file_name = self._to_filename(self._space_config['space_name'], page_dict["title"])
            file_path = self._space_config['confluence_templates_dir'] + file_name + ".html"
            self._gen_html_file(file_path, page_dict)
            pages.append({'title': page_dict["title"], 
                          'name': file_name, 
                          'url': '/' + self._space_config['space_name'] + '/' + file_name,
                          'parentId': page_dict['parentId'], 
                          'id': page_dict['id']})
        
        space_id = self._get_space_id(pages)
        self._nav_generator.build_tree(pages, space_id)
        
        self._gen_python_views_file(pages)
        return self._nav_generator.gen_leftnavbar()
    
    def execute2(self):
        url = self._server.confluence2.exportSpace(self._token, self._space_config['space_name'], "TYPE_HTML")
        print(url)
        response = requests.get(url, stream=True, auth=(self._username, self._password))
        if response.status_code == 200:
            file_path = '/root/space.zip'
            with open(file_path, 'wb') as fhandle:
                for chunk in response.iter_content(1024):
                    fhandle.write(chunk)

    def get_spaces(self):
        spaces = self._server.confluence2.getSpaces(self._token)
        for space in spaces:
            print(space)


def prompt_username():
    username = raw_input("Please enter your username: ")    
    return username


def prompt_password():    
    password = getpass.getpass("Please enter your password: ")
    return password


def main():
    scrapper_config = read_yaml('scrapper_config.yml')
    if not scrapper_config.get('username'):
        username = prompt_username()
    else:
        username = scrapper_config.get('username')

    if not scrapper_config.get('password'):
        password = prompt_password()
    else:
        password = scrapper_config.get('password')
        
    top_nav_urls = []
    for space_config in scrapper_config['confluence_spaces']:        
        html_gen = HtmlGenerator(space_config, username, password)        
        topnav_url = html_gen.execute()
        top_nav_urls.append(topnav_url)
    
    # TODO ugly hack which will get fixed in the refactor.
    try:
        thisiscvah_url = top_nav_urls[0]['url']
    except Exception:
        thisiscvah_url = None

    try:
        jcctm_url = top_nav_urls[1]['url']
    except Exception:
        jcctm_url = None


    if thisiscvah_url and jcctm_url:
        gen_topnavbar(thisiscvah_url, jcctm_url)
    elif thisiscvah_url:
        gen_topnavbar(thisiscvah_url)
    elif jcctm_url:
        gen_topnavbar(jcctm_url=jcctm_url)
    else:
        gen_topnavbar()

if __name__ == "__main__":
    main()    
