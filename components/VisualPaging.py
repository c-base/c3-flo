#!/usr/bin/env python3

import msgflo
import urllib.parse
import os

class VisualPaging(msgflo.Participant):
  def __init__(self, role):
    d = {
      'component': 'c3-flo/VisualPaging',
      'label': 'Generate a visual paging URL for textual messages',
      'icon': 'font',
      'inports': [
        { 'id': 'in', 'type': 'string' },
      ],
      'outports': [
        { 'id': 'out', 'type': 'string' },
      ],
    }
    msgflo.Participant.__init__(self, d, role)

  def process(self, inport, msg):
    baseUrl = os.environ['INFOSCREENS_URL']
    url = '%s/visual-paging/?%s' % (baseUrl, urllib.parse.quote(msg.data.encode('utf-8')))
    self.send('out', url)
    self.ack(msg)

if __name__ == '__main__':
  msgflo.main(VisualPaging)
