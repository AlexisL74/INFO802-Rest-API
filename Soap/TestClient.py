import zeep

wsdl = 'https://info802soap-e2aebkf9hgaag9f2.francecentral-01.azurewebsites.net/?wsdl'
client = zeep.Client(wsdl=wsdl)

print(client.service.calcTemp(436000, 1800, 100000)/3600)