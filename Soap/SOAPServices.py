from spyne import Application, rpc, ServiceBase, Iterable, Integer, Unicode, Float
from spyne.protocol.soap import Soap11
from spyne.server.wsgi import WsgiApplication
import lxml


class CalcServices(ServiceBase):
    @rpc(Integer, Integer, Integer, _returns=Float)
    def calcTemp(ctx, distance, rechargeTime, autonomy):        
        velocity = 80/3.6
        res = distance / velocity

        nbRecharge = distance // autonomy
        res += nbRecharge * rechargeTime

        return res
    
    @rpc(Integer, _returns=Float)
    def calcPrice(ctx, distance):
        cost_of_electricity = 0.15
        energy_consumption_rate = 0.2
        recharge_efficiency = 0.9
        total_energy_required = (distance * energy_consumption_rate) / recharge_efficiency
        recharge_price = total_energy_required * cost_of_electricity
        return recharge_price

application = Application([CalcServices], 'spyne.examples.hello.soap',
    in_protocol=Soap11(validator='lxml'),
    out_protocol=Soap11())
wsgi_application = WsgiApplication(application)

from wsgiref.simple_server import make_server
server = make_server('127.0.0.1', 8000, wsgi_application)
server.serve_forever()