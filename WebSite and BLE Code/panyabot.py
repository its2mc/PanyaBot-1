import time
import json
from flask import Flask, render_template, request
import bluetooth

print "Starting Panyabot"
app = Flask(__name__)

#Template Commands
	
#Device Setup Simulation
@app.route('/discoverDevices')
def discoverDevices():
	print("performing inquiry...")

	nearby_devices = bluetooth.discover_devices(duration=8, lookup_names=True, flush_cache=True, lookup_class=False)

	print("found %d devices" % len(nearby_devices))

	print json.dumps(nearby_devices)
	return json.dumps(nearby_devices)

@app.route('/recieveCommands')
def recieveCommands():
	server_sock=bluetooth.BluetoothSocket( bluetooth.RFCOMM )

	port = 1
	server_sock.bind(("",port))
	server_sock.listen(1)

	client_sock,address = server_sock.accept()
	print "Accepted connection from ",address

	data = client_sock.recv(1024)
	print "received [%s]" % data

	client_sock.close()
	server_sock.close()
	return data

@app.route('/sendCommands')
def sendCommands():
	if 'bd_arr' in request.args:
		bd_arr = request.args['bd_arr']
	else: 
		bd_addr = "44:74:6C:A3:03:DA"
	if 'command' in request.args:
		command = request.args['command']
	else: 
		command = "Hello!!"

	port = 1

	sock=bluetooth.BluetoothSocket( bluetooth.RFCOMM )
	sock.connect((bd_addr, port))

	sock.send(command)

	sock.close()
	return "Sent Commands"


if __name__ == '__main__':
	app.debug = True
	app.run(host='0.0.0.0')