#!/usr/bin/env python
import gevent
import msgflo
import datetime

class Clock(msgflo.Participant):
    def __init__(self, role):
        d = {
                'component': 'c3-flo/Clock',
                'label': 'Station clock as used at events',
                'icon': 'clock-o',
                'inports': [
                    { 'id': 'start', 'type': 'bang' },
                    { 'id': 'stop', 'type': 'bang' },
                    ],
                'outports': [
                    { 'id': 'out', 'type': 'string' },
                    ],
                }
        self.is_enabled = False
        msgflo.Participant.__init__(self, d, role)

    def loop(self):
        while self.is_enabled == True:
            timestamp = datetime.datetime.utcnow().replace(tzinfo=datetime.timezone.utc).isoformat()
            self.send('out', timestamp)
            # Wait for a minute
            gevent.sleep(60)

    def process(self, inport, msg):
        if inport == 'start':
            self.is_enabled = True
            gevent.Greenlet.spawn(self.loop)
        elif inport == 'stop':
            self.is_enabled = False
        self.ack(msg)

if __name__ == '__main__':
    msgflo.main(Clock)
