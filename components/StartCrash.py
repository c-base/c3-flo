#!/usr/bin/env python3
import msgflo

class StartCrash(msgflo.Participant):
  def __init__(self, role):
    d = {
      'component': 'c3-flo/StartCrash',
      'label': 'Initiate the crash of c-base',
      'icon': 'heartbeat',
      'inports': [
        { 'id': 'in', 'type': 'boolean' },
      ],
      'outports': [
        { 'id': 'out', 'type': 'string' },
      ],
    }
    msgflo.Participant.__init__(self, d, role)

  def process(self, inport, msg):
    if inport == 'in':
      if msg.data:
        # Send the name of the crash animation to run
        self.send('out', 'crash')
    self.ack(msg)

if __name__ == '__main__':
  msgflo.main(StartCrash)
