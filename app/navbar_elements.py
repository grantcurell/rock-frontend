from collections import OrderedDict

# If you need to add elements to the navbar you can do it here
# In python2 you must use an ordered dict because python 2 sucks and for some reason
# does not respect dictionary declaration order. I hate python 2.
NAVBAR_ELEMENTS = OrderedDict([
('Kickstart Configuration', {'url': '/kickstart', 'key': 'tn_kickstart'})
, ('Kit Configuration', {'url': '/kit_configuration', 'key': 'tn_kit_configuration'})
, ('Confluence THISISCVAC', {'url': '/THISISCVAH/THISISCVAH_20_technical_style_guide', 'key': 'tn_system_design'})
, ('Confluence JCCTM', {'url': '/OJCCTM/OJCCTM_u_capability_catalogue_softwareortools_uororfouo',
                        'key': 'tn_capabilities_by_category_softwareortools'})
, ('Help', {'url': '/help', 'key': 'tn_help'})])