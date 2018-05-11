App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // Initialize web3 and set the provider to the testRPC.
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // set the provider you want from Web3.providers
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
      web3 = new Web3(App.web3Provider);
    }

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('ArriendoFactory.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract.
      var ArriendoFactoryArtifact = data;
      App.contracts.ArriendoFactory = TruffleContract(ArriendoFactoryArtifact);

      // Set the provider for our contract.
      App.contracts.ArriendoFactory.setProvider(App.web3Provider);

      // Use our contract to retieve and mark the adopted pets.
      return App.getBalances();
    });

    return App.bindEvents1();
  },

  bindEvents1: function() {
    $(document).on('click', '#registrarCertificado', App.handleTransfer1);
    $(document).on('click', '#searchCertificado', App.handleTransfer2);
    $(document).on('click', '#registrarArrendador', App.handleTransfer3);
    $(document).on('click', '#registrarPropietario', App.handleTransfer6);
    $(document).on('click', '#registrarInmueble', App.handleTransfer7);
    $(document).on('click', '#registrarArriendo', App.handleTransfer4);
    $(document).on('click', '#registrarNotificacion', App.handleTransfer8);
    
  },


  handleTransfer1: function() {
    event.preventDefault();

    var TTTipoCertificado = $('#TTTipoCertificado').val();
    var TTDescCertificado = $('#TTDescCertificado').val();
    var TTCIPersona = $('#TTCIPersona').val();
    var TTNombrePersona = $('#TTNombrePersona').val();
    var TTApellidoPersona = $('#TTApellidoPersona').val();
    var TTID_Generado = $('#TTID_Generado').val();

    console.log('TTTipoCertificado ' + TTTipoCertificado +
               ' TTDescCertificado ' + TTDescCertificado +
               ' TTCIPersona ' + TTCIPersona +
               ' TTNombrePersona ' + TTNombrePersona +
               ' TTApellidoPersona ' + TTApellidoPersona +
               ' TTID_Generado ' + TTID_Generado );

    //var tutorialTokenInstance;
    var ArriendoFactoryInstance;
    var valhash;

    web3.eth.getAccounts(function(error, accounts) {
      App.contracts.ArriendoFactory.deployed().then(function(instance) {
      ArriendoFactoryInstance = instance;
      console.log('paso 1 registro certificado ');
      //var valhash = web3.utils.randomHex(32)


      var currentdate = new Date();
      console.log('paso 2 currentdate ' + currentdate);
      valhash_66 = web3.sha3(TTTipoCertificado+TTDescCertificado+TTCIPersona + currentdate);
      valhash = valhash_66.substring(0,42);
      //valhash = web3.sha3(leftPad((1).toString(16), 64, 0), { encoding: 'hex' })
      console.log('paso 2 registro certificado ' + valhash);
      return  ArriendoFactoryInstance.createCertificado(valhash,
                                                      TTTipoCertificado,
                                                      TTDescCertificado,
                                                      TTCIPersona,
                                                      TTNombrePersona,
                                                      TTApellidoPersona);

    }).then(function(result) {
      alert('Certificado Registrado! ' +  valhash);
      $('#TTID_Generado').text(valhash);
      }).catch(function(err) {
        alert('Error al registar Certificado! ');
        console.log(err.message);
      });
    });
  },

  handleTransfer2: function() {
    event.preventDefault();

    var TTID_Certificado = $('#TTID_Certificado').val();
    var TTMontoPago = parseFloat($('#TTMontoPago').val());

    console.log('idCertificado ' + TTID_Certificado +' TTMontoPago ' + web3.toWei(TTMontoPago, 'ether'));


    var ArriendoFactoryInstance;

      console.log('paso 1 search certificado');

      App.contracts.ArriendoFactory.deployed().then(function(instance) {
        ArriendoFactoryInstance = instance;

        return ArriendoFactoryInstance.searchCertificado(TTID_Certificado, {value: web3.toWei(TTMontoPago, 'ether')});
      }).then(function(result) {

        //console.log(result);
        //console.log(JSON.stringify(result))

        // We can loop through result.logs to see if we triggered the Transfer event.
        for (var i = 0; i < result.logs.length; i++) {
          var log = result.logs[i];

          if (log.event == "SearchCertificado") {
             console.log(JSON.stringify(log.args));
             //console.log(log.args["_dirUniversidad"]);
             var dirUniversidad = log.args["_dirUniversidad"];
             var nombreUniversidad = log.args["_nombreUniversidad"];
             var descTipo = log.args["_descTipo"];
             var descTitulo = log.args["_descTitulo"];
             var ciPersona = log.args["_dniPersona"];
             var nombrePersona = log.args["_nombrePersona"] + ', '+ log.args["_apellidoPersona"];
             //var apellidoPersona = log.args["_apellidoPersona"];
             var readyTime = log.args["_readyTime"];

             var datetime = new Date(readyTime*1000);
             var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
             var year = datetime.getFullYear();
             var month = months[datetime.getMonth()];
             var date = datetime.getDate();
             var hours = datetime.getHours();
             var minutes = "0" + datetime.getMinutes();
             var seconds = "0" + datetime.getSeconds();
             var formattedTime = date + ' ' + month + ' ' + year + ' ' + hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);

             $('#TTID_Certificado2').text(TTID_Certificado);
             $('#TTDir_Universidad').text(dirUniversidad);
             $('#TTNombre_Universidad').text(nombreUniversidad);
             $('#TTTipoCertificado').text(descTipo);
             $('#TTDescCertificado').text(descTitulo);
             $('#TTCIPersona').text(ciPersona);
             $('#TTnombreAlumno').text(nombrePersona);
             $('#TTfechaRegistro').text(formattedTime);

            // We found the event!
            break;
          }
      }


        //$('#TTID_Generado').text(result);
        //return App.getBalances();
      }).catch(function(err) {
        console.log(err.message);
      });
  },

  handleTransfer3: function() {
    event.preventDefault();

    var TTDir_Arrendador = $('#TTDir_Arrendador').val();
    var TTNombre_Arrendador = $('#TTNombre_Arrendador').val();

    console.log('TTDir_Arrendador ' + TTDir_Arrendador +
               ' TTNombre_Arrendador ' + TTNombre_Arrendador );

    //var tutorialTokenInstance;
    var ArriendoFactoryInstance;

    web3.eth.getAccounts(function(error, accounts) {
      App.contracts.ArriendoFactory.deployed().then(function(instance) {
      ArriendoFactoryInstance = instance;
      console.log('paso 1 registro Arrendador ');
      //var valhash = web3.utils.randomHex(32)

      return  ArriendoFactoryInstance.setArrendador(
                                                    TTNombre_Arrendador);

    }).then(function(result) {
      alert('Arrendador Registrado! ');
      $('#TTEstado_Registro').text('Arrendador REGISTRADA...');
      }).catch(function(err) {
        alert('Error al registar Arrendador! ');
        console.log(err.message);
        $('#TTEstado_Registro').text('ERROR AL REGISTRAR Arrendador...');
      });
    });
  },

  handleTransfer4: function() {
    event.preventDefault();

    var TTDir_Propietario2 = $('#TTDir_Propietario2').val();
    var TTDir_Inmueble2 = $('#TTDir_Inmueble2').val();
    var TTPrecio_Arriendo2 = $('#TTPrecio_Arriendo2').val();
    var TTTiempo_Arriendo2 = $('#TTTiempo_Arriendo2').val();
    var TTMto_Pagar2 = $('#TTMto_Pagar2').val();


    console.log('TTDir_Propietario2 ' + TTDir_Propietario2 +
               ' TTDir_Inmueble2 ' + TTDir_Inmueble2 +
               ' TTPrecio_Arriendo2 ' + TTPrecio_Arriendo2 +
               ' TTTiempo_Arriendo2 ' + TTTiempo_Arriendo2 +
               ' TTMto_Pagar2 ' + TTMto_Pagar2);

    //var tutorialTokenInstance;
    var ArriendoFactoryInstance;

    web3.eth.getAccounts(function(error, accounts) {
      App.contracts.ArriendoFactory.deployed().then(function(instance) {
      ArriendoFactoryInstance = instance;
      console.log('paso 1 registro arriendo ');
      valhash_66 = web3.sha3(TTDir_Propietario2+TTDir_Inmueble2+TTPrecio_Arriendo2 + TTTiempo_Arriendo2);
      hashArriendo = valhash_66.substring(0,42);
      //valhash = web3.sha3(leftPad((1).toString(16), 64, 0), { encoding: 'hex' })
      console.log('paso 2 hash Arriendo ' + hashArriendo);

      return  ArriendoFactoryInstance._enviarDeposito_Contrato(hashArriendo,
                                                               TTDir_Propietario2,
                                                               TTDir_Inmueble2,
                                                               TTTiempo_Arriendo2,
                                                               TTPrecio_Arriendo2,
                                                               1, //Reserva
                                                               {value: web3.toWei(TTMto_Pagar2, 'ether')});

    }).then(function(result) {
         if (result == ""){
           alert('Arriendo No Registrado! ' );
         }else {
           alert('Arriendo Registrado! ' + result);
           $('#TTEstado_Registro4').text(hashArriendo);
         }  

      }).catch(function(err) {
        alert('Error al registar Arriendo! ');
        console.log(err.message);
        $('#TTEstado_Registro4').text('ERROR AL REGISTRAR ARRIENDO...');
      });
    });
  },

  handleTransfer6: function() {
    event.preventDefault();

    var TTDir_Propietario = $('#TTDir_Propietario').val();
    var TTNombre_Propietario = $('#TTNombre_Propietario').val();

    console.log('TTDir_Propietario ' + TTDir_Propietario +
               ' TTNombre_Propietario ' + TTNombre_Propietario );

    //var tutorialTokenInstance;
    var ArriendoFactoryInstance;

    web3.eth.getAccounts(function(error, accounts) {
      App.contracts.ArriendoFactory.deployed().then(function(instance) {
      ArriendoFactoryInstance = instance;
      console.log('paso 1 registro Propietario ');
      //var valhash = web3.utils.randomHex(32)

      return  ArriendoFactoryInstance.setPropietario(
                                                    TTNombre_Propietario);

    }).then(function(result) {
      alert('Propietario Registrado! ');
      $('#TTEstado_Registro2').text('Propietario REGISTRADA...');
      }).catch(function(err) {
        alert('Error al registar Propietario! ');
        console.log(err.message);
        $('#TTEstado_Registro2').text('ERROR AL REGISTRAR Propietario...');
      });
    });
  },

  handleTransfer7: function() {
    event.preventDefault();

    var TTDir_Inmueble = $('#TTDir_Inmueble').val();
    var TTTipo_Inmueble = $('#TTTipo_Inmueble').val();
    var TTDireccion = $('#TTDireccion').val();
    var TTDescripcion = $('#TTDescripcion').val();
    var TTEstado = $('#TTEstado').val();

    console.log('TTDir_Inmueble ' + TTDir_Inmueble +
               ' TTTipo_Inmueble ' + TTTipo_Inmueble +
               ' TTDireccion ' + TTDireccion +
               ' TTDescripcion ' + TTDescripcion +
               ' TTEstado ' + TTEstado);

    //var tutorialTokenInstance;
    var ArriendoFactoryInstance;

    web3.eth.getAccounts(function(error, accounts) {
      App.contracts.ArriendoFactory.deployed().then(function(instance) {
      ArriendoFactoryInstance = instance;
      console.log('paso 1 registro Inmueble ');
      //var valhash = web3.utils.randomHex(32)

      return  ArriendoFactoryInstance.setInmueble(TTDir_Inmueble,
                                                     TTTipo_Inmueble,
                                                     TTDireccion,
                                                     TTDescripcion,
                                                     TTEstado
                                                    );

    }).then(function(result) {
      alert('Inmueble Registrado! ');
      $('#TTEstado_Registro4').text('Inmueble REGISTRADO...');
      }).catch(function(err) {
        alert('Error al registar Inmueble! ');
        console.log(err.message);
        $('#TTEstado_Registro4').text('ERROR AL REGISTRAR Inmueble...');
      });
    });
  },

  handleTransfer8: function() {
    event.preventDefault();

    var TTHash_Arriendo = $('#TTHash_Arriendo').val();
    var TTEstado_Arriendo = 2

    console.log('TTHash_Arriendo ' + TTHash_Arriendo +
               ' TTEstado_Arriendo ' + TTEstado_Arriendo);

    //var tutorialTokenInstance;
    var ArriendoFactoryInstance;

    web3.eth.getAccounts(function(error, accounts) {
      App.contracts.ArriendoFactory.deployed().then(function(instance) {
      ArriendoFactoryInstance = instance;
      console.log('paso 1 registro estado arriendo ');

      return  ArriendoFactoryInstance._notificarEstadoArriendo(TTHash_Arriendo,
                                                               TTEstado_Arriendo);

    }).then(function(result) {
         if (result == ""){
           alert('Estado No Registrado! ' );
         }else {
           alert('Estado Registrado! ' + result);
           $('#TTEstado_Registro10').text('NOTIFICACION ENVIADA CON EXITO...');
         }  

      }).catch(function(err) {
        alert('Error al registar Estado! ');
        console.log(err.message);
        $('#TTEstado_Registro10').text('ERROR AL REGISTRAR ESTADO...');
      });
    });
  },


  getBalances: function(adopters, account) {
    console.log('Getting balances...');

    var ArriendoFactoryInstance;

    web3.eth.getAccounts(function(error, accounts) {

    var account = accounts[0];
    console.log('obteniendo direccion cuenta 0 '+ account );

    App.contracts.ArriendoFactory.deployed().then(function(instance) {
        ArriendoFactoryInstance = instance;
        //return ArriendoFactoryInstance.get_balance(account); //getBalances(account);
        //return ArriendoFactoryInstance.get_balance(TTCtaAseguradoAddress); //getBalances(account);
        console.log('obteniendo direccion owner 1' );
        //return ArriendoFactoryInstance.getOwnerContrato();
        return ArriendoFactoryInstance.address;
      }).then(function(result_dir) {
        console.log('obteniendo direccion owner 3' + result_dir);
        $('#TTDir_Contrato').text(result_dir);
      }).catch(function(err) {
        console.log(err.message);
      });



      App.contracts.ArriendoFactory.deployed().then(function(instance) {
        ArriendoFactoryInstance = instance;
        console.log('Obteniendo Cta Banco Asegurado');
        return ArriendoFactoryInstance.get_cta_beneficiario();
      }).then(function(result_cta) {
        resultado = result_cta;
        $('#TTCta_beneficiario').text(resultado);
      }).catch(function(err) {
        console.log(err.message);
      });




    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
