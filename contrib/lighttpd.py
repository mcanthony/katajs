#!/usr/bin/python

# A simple wrapper for running lighttpd on your katajs.git
# directory. Generates an appropriate configuration and runs lighttpd
# with it.

import sys
import os
import tempfile

def main():

    conf = """
server.modules              = (
            "mod_access",
            "mod_alias",
            "mod_accesslog",
            "mod_compress"
)
server.document-root       = "%(pwd)s/"
server.errorlog            = "%(pwd)s/lighttpd.error.log"
index-file.names           = ( "index.php", "index.html",
                               "index.htm", "default.htm",
                               "index.lighttpd.html" )
accesslog.filename         = "%(pwd)s/lighttpd.access.log"
url.access-deny            = ( "~", ".inc" )
server.port               = 8888
#include_shell "/usr/share/lighttpd/create-mime.assign.pl"
# Set up the appropriate MIME type mappings
mimetype.assign             = (
  ".pdf"          =>      "application/pdf",
  ".sig"          =>      "application/pgp-signature",
  ".spl"          =>      "application/futuresplash",
  ".class"        =>      "application/octet-stream",
  ".ps"           =>      "application/postscript",
  ".torrent"      =>      "application/x-bittorrent",
  ".dvi"          =>      "application/x-dvi",
  ".gz"           =>      "application/x-gzip",
  ".pac"          =>      "application/x-ns-proxy-autoconfig",
  ".swf"          =>      "application/x-shockwave-flash",
  ".tar.gz"       =>      "application/x-tgz",
  ".tgz"          =>      "application/x-tgz",
  ".tar"          =>      "application/x-tar",
  ".zip"          =>      "application/zip",
  ".mp3"          =>      "audio/mpeg",
  ".m3u"          =>      "audio/x-mpegurl",
  ".wma"          =>      "audio/x-ms-wma",
  ".wax"          =>      "audio/x-ms-wax",
  ".ogg"          =>      "application/ogg",
  ".wav"          =>      "audio/x-wav",
  ".gif"          =>      "image/gif",
  ".jpg"          =>      "image/jpeg",
  ".jpeg"         =>      "image/jpeg",
  ".png"          =>      "image/png",
  ".xbm"          =>      "image/x-xbitmap",
  ".xpm"          =>      "image/x-xpixmap",
  ".xwd"          =>      "image/x-xwindowdump",
  ".css"          =>      "text/css",
  ".html"         =>      "text/html",
  ".htm"          =>      "text/html",
  ".js"           =>      "text/javascript",
  ".asc"          =>      "text/plain",
  ".c"            =>      "text/plain",
  ".cpp"          =>      "text/plain",
  ".log"          =>      "text/plain",
  ".conf"         =>      "text/plain",
  ".text"         =>      "text/plain",
  ".txt"          =>      "text/plain",
  ".dtd"          =>      "text/xml",
  ".xml"          =>      "text/xml",
  ".mpeg"         =>      "video/mpeg",
  ".mpg"          =>      "video/mpeg",
  ".mov"          =>      "video/quicktime",
  ".qt"           =>      "video/quicktime",
  ".avi"          =>      "video/x-msvideo",
  ".asf"          =>      "video/x-ms-asf",
  ".asx"          =>      "video/x-ms-asf",
  ".wmv"          =>      "video/x-ms-wmv",
  ".bz2"          =>      "application/x-bzip",
  ".tbz"          =>      "application/x-bzip-compressed-tar",
  ".tar.bz2"      =>      "application/x-bzip-compressed-tar"
 )
#include_shell "/usr/share/lighttpd/include-conf-enabled.pl"
""" % { 'pwd' : os.getcwd() }
    print conf

    tmp_conf_file = tempfile.NamedTemporaryFile(delete = False)
    tmp_conf_file.write(conf)
    tmp_conf_file.close()

    print tmp_conf_file.name
    print 'lighttpd-angel -D -f %s' % (tmp_conf_file.name)
    os.system('lighttpd-angel -D -f %s' % (tmp_conf_file.name))
    return 0

if __name__ == "__main__":
    sys.exit(main())
