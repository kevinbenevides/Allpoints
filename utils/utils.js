class Utils {
    constructor(){

    }

    // Retorna true se valido false se invalido. Ex de string pra enviar: '12345678901'
    cpfValidation(cpf){
        var Soma;
        var Resto;
        Soma = 0;
        
        if (cpf == "00000000000") return false;
    
        for (var i=1; i<=9; i++) Soma = Soma + parseInt(cpf.substring(i-1, i)) * (11 - i);
        Resto = (Soma * 10) % 11;
    
        if ((Resto == 10) || (Resto == 11))  Resto = 0;
        if (Resto != parseInt(cpf.substring(9, 10)) ) return false;
    
        Soma = 0;
        for (i = 1; i <= 10; i++) Soma = Soma + parseInt(cpf.substring(i-1, i)) * (12 - i);
        Resto = (Soma * 10) % 11;
    
        if ((Resto == 10) || (Resto == 11))  Resto = 0;
        if (Resto != parseInt(cpf.substring(10, 11) ) ) return false;
        return true;
    }

    emailValidation(email) {
        var index_email = email.substring(0, email.indexOf("@")); 
        var dominio = email.substring(email.indexOf("@") + 1, email.length); 
        if ((index_email.length >= 1) &&
            (dominio.length >= 3) &&
            (index_email.search("@") == -1) &&
            (dominio.search("@") == -1) &&
            (index_email.search(" ") == -1) &&
            (dominio.search(" ") == -1) &&
            (dominio.search(".") != -1) &&
            (dominio.indexOf(".") >= 1) &&
            (dominio.lastIndexOf(".") < dominio.length - 1)) {
            return true
        } else {
            return false
        }
    }

    passwordValidation(password) {
        var letraMaiuscula = 0;
        var letraMinuscula = 0;
        var numero = 0;
        var caracterEspecial = 0;
        var caracteresEspeciais = "/([~`!@#$%\^&*+=\-\[\]\\';,/{}|\" :<>\?])";
    
        if (password.length < 8) {
            return 'falsePasswordLength'
        } else {
            for (var i = 0; i <= password.length; i++) {
                var valorAscii = password.charCodeAt(i);
                //letraMaiuscula A até Z 
                valorAscii >= 65 && valorAscii <= 90 ? letraMaiuscula++ : null;
                //letraMinuscula a até z 
                valorAscii >= 97 && valorAscii <= 122 ? letraMinuscula++ : null;
                // de 0 até 9
                valorAscii >= 48 && valorAscii <= 57 ? numero++ : null;
                // indexOf retorna -1 quando NÃO encontra
                caracteresEspeciais.indexOf(password[i]) != -1 ? caracterEspecial++ : null
            } if (numero < 1) {
                return 'falseNumber'
            } else if (letraMinuscula < 1 && letraMaiuscula < 1) {
                return 'falseLetter'
            }
            return true
        }
    }

    countDown(countDownDate){
        var now = new Date().getTime();
        var timeleft = countDownDate - now;
            
        // Calculating the days, hours, minutes and seconds left
        var minutes = Math.floor((timeleft % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((timeleft % (1000 * 60)) / 1000);

        if (seconds < 10) {
            seconds = '0' + seconds
        }
        if (minutes < 10) {
            minutes = '0' + minutes
        }
        if (timeleft < 0) {
            return '00:00'
        }
            
        // Result is output to the specific element
        return minutes + ":" + seconds
    }
}

window.Utils = Utils;

export {Utils}