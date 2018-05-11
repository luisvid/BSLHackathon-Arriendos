pragma solidity ^0.4.17;

import "./Ownable.sol";
import "./SafeMath.sol";

contract ArriendoFactory is Ownable {
  using SafeMath for uint256;

  event NewPropietario(address _dirPropietario, string _nombrePropietario);
  event NewArrendador(address _dirArrendador,string _nombreArrendador);
  event NewInmueble(address _dirPropietario, address _dirInmueble, string _descDireccion, string _descDescripcion, string _descEstado);
  event NewArriendo(address _dirPropietario,address _dirArrendador,address _dirInmueble,uint32 _tiempoArriendo, uint256 _costoArriendo,uint256 _mtoPagado,uint32 _descEstado);

  address dirOwnerContrato;
  uint codigoDigits = 16;
  uint codigoModulus = 10 ** codigoDigits;
  uint cooldownTime = 1 days;
  uint costoSearch = 0.002 ether;


  struct Arriendo {
    address dirPropietario;
    address dirArrendador;
    address dirInmueble;
    uint32 readyTime;//fecha de registro de Contrato Arriendo
    uint32 tiempoArriendo;//fecha de registro de Contrato Arriendo
    uint256 costoArriendo;
    uint256 mtoPagado;
    uint32 descEstado; // 1 = reservado, 2 = arrendado, 3 = rechazado, 
  }

  struct Inmueble {
    string descTipo;
    string descDireccion;
    string descDescripcion;
    string descEstado;//disponibilidad
  }

  //Arriendo[] public Arriendos;

  mapping (address => Arriendo) Arriendos;
  mapping (address => Inmueble) Inmuebles;
  mapping (address => uint) ownerInmuebleCount;
  mapping (address => address) ownerInmueble;
  mapping (address => string) Propietario;
  mapping (address => string) Arrendador;

  function ArriendoFactory() public{
    //ownable();
    dirOwnerContrato = msg.sender;
    }

  function getOwnerContrato() public  returns (address){
    return dirOwnerContrato;
  }

 /*****************************/
 /****    PROPIETARIO     *****/
 /*****************************/
  //function setPropietario(address _dirPropietario,string _nombrePropietario) public {
  function setPropietario(string _nombrePropietario) public {
    address _dirPropietario = msg.sender;
    Propietario[_dirPropietario] = _nombrePropietario;
    NewPropietario(_dirPropietario,_nombrePropietario);
  }

  function getPropietario(address _dirPropietario) public returns (string nombrePropietario) {
    return Propietario[_dirPropietario];
  }

 /*****************************/
 /****    ARRENDADOR      *****/
 /*****************************/
  //function setArrendador(address _dirArrendador,string _nombreArrendador) public {
  function setArrendador(string _nombreArrendador) public {
    address _dirArrendador = msg.sender;
    Arrendador[_dirArrendador] = _nombreArrendador;
    NewArrendador(_dirArrendador,_nombreArrendador);
  }

  function getArrendador(address _dirArrendador) public returns (string _nombreArrendador) {
    return Arrendador[_dirArrendador];
  }

 /*************************/
 /****    INMUEBLE     ****/
 /*************************/
  function setInmueble(address _dirInmueble,string _descTipo,string _descDireccion,string _descDescripcion,string _descEstado) public {
    address _dirPropietario = msg.sender;
    Inmuebles[_dirInmueble] = Inmueble(_descTipo,_descDireccion,_descDescripcion,_descEstado);
    ownerInmueble[_dirInmueble] = _dirPropietario;
    ownerInmuebleCount[_dirPropietario]++;
    NewInmueble(_dirPropietario,_dirInmueble, _descDireccion, _descDescripcion,_descEstado);
  }

  function getInmueble(address _dirInmueble) public returns(string _descTipo,string _descDireccion,string _descDescripcion,string _descEstado){
      Inmueble storage _inmueble = Inmuebles[_dirInmueble];
        return (_inmueble.descTipo,            
                _inmueble.descDireccion,
                _inmueble.descDescripcion,
                _inmueble.descEstado);
  }


 /******************************/
 /****   ENVIAR DEPOSITO   *****/
 /******************************/
  function _enviarDeposito_Contrato(address hashArriendo, address _dirPropietario,address _dirInmueble,uint32 _tiempoArriendo, uint256 _costoArriendo,uint32 _descEstado)  payable {
    //require(msg.sender == dirOwnerContrato); 
    uint256 _mtoPagado = msg.value;
    address _dirArrendador = msg.sender;
    if (_mtoPagado < _costoArriendo) {
       revert ();
    } else {

      Arriendos[hashArriendo] = Arriendo(_dirPropietario,_dirArrendador,_dirInmueble,uint32(now),_tiempoArriendo,_costoArriendo,_mtoPagado,_descEstado);
      dirOwnerContrato.transfer(_mtoPagado);
      //dirOwnerContrato.transfer(address(this).balance);
      //Poner el inmueble a estado reservado
      Inmuebles[_dirInmueble].descEstado = 'Reservado';
      NewArriendo(_dirPropietario,_dirArrendador,_dirInmueble,_tiempoArriendo,_costoArriendo,_mtoPagado,_descEstado);
      
    }
  }

 /**************************/
 /****   NOTIFICAR    *****/
 /*************************/
  function _notificarEstadoArriendo(address _hashArriendo, uint32 _descEstado) public {
    //uint256 mtoPagado_p = msg.value;
    address _dirArrendador = msg.sender;
    Arriendo storage _arriendo = Arriendos[_hashArriendo];
    if (_dirArrendador == _arriendo.dirArrendador) {
      address _dirPropietario = _arriendo.dirPropietario;
      uint256 _mtoPagado = _arriendo.mtoPagado;
      Arriendos[_hashArriendo].descEstado = _descEstado;
      //dirOwnerContrato.transfer(_mtoPagado); 
    //} else {
    //   revert ();
    }
  }

 /*****************************************************************/
 /****   CONTRATO ENVIA DINERO DE ACUERDO A ESTADO ARRIENDO   *****/
 /*****************************************************************/
  function _contratoEnviaDeposito(address _hashArriendo) payable  {
    //uint256 mtoPagado_p = msg.value;
    require(msg.sender == dirOwnerContrato); 
    Arriendo storage _arriendo = Arriendos[_hashArriendo];
      address _dirPropietario = _arriendo.dirPropietario;
      address _dirArrendador  = _arriendo.dirArrendador;
      uint256 _mtoPagado = _arriendo.mtoPagado;
      if(_arriendo.descEstado == 2 ) { //se paga a Propietario
          _dirPropietario.transfer(_mtoPagado); 
      }
      if(_arriendo.descEstado == 3 ) { //se devuelve dinero a Arrendatario
          _dirArrendador.transfer(_mtoPagado); 
      }
  }

}
