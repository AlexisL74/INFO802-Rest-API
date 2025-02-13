import zeep

wsdl = 'http://localhost:8000/?wsdl'
client = zeep.Client(wsdl=wsdl)

print(client.service.calcTemp(436000, 1800, 100000)/3600)