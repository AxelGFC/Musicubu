//Informacion del index
var campoBPM = document.getElementById("BPM");
var campoEstilo = document.getElementById("estilo");
var campoNota = document.getElementById("nota");
var campoTipoEscala = document.getElementById("tipoEscala");
var campoTipoPercusion = document.getElementById("percusion");

var contextoAudio,oscilador,gainNode;//variables de sonido necesarias de js
var bpm,bpm_seg,bpm_decseg,bpm_miliseg//Medidas de tiempo

var notasBase = [];
var escalaFormada = [];
var Cancion = [];

var escalaMayor = [0,2,4,5,7,9,11,12]//TTSTTTS
var escalaMenor = [0,2,3,5,7,8,10,12]//TSTTSTT

//Creando las 12 notas que se usaran como base
var notaDoBase = 130.8128;
for (let i = 0; notasBase.length < 13; i++) 
    {
        if(i!=0){notaDoBase*=2**(1/12);}
        notasBase[i] = notaDoBase;
    }

function crearEscala(escala,frecuenciaBase)//creamos una escala con las elecciones del usuario
{
    let base = [];
    escalaFormada = [];

    //Creamos las notas base de la escala
    for (let i = 0; base.length < 13; i++) 
    {
        if(i!=0){frecuenciaBase*=2**(1/12);}
        base[i] = frecuenciaBase;
    }

    //Descartamos notas segun el tipo de escala
    if(escala)//Si la escala es mayor
    {
        for (let i = 0; i < escalaMayor.length; i++) {
            escalaFormada.push(base[escalaMayor[i]]);
        }
    }
    else//Si la escala es menor
    {
        for (let i = 0; i < escalaMayor.length; i++) {
            escalaFormada.push(base[escalaMenor[i]]);
        }
    }
}

//Funcion que devuelve true o false a partir de una probabilidad
function BooleanoAleatorio(probabilidad) {return Math.random() < probabilidad;}

function CrearCancionAleatoria(escala)//Creamos la cancion a partir de una escala
{
    let compasLocal = 4;
    let notaAleatoria = 0;
    for (let i = 0; i < 60; i++) {
        if(compasLocal==0)
        {
            if (BooleanoAleatorio(0.5))//Probabilidad del 50% de que un compas se repita
            {
                let listaTemporal = [];
                for (let x = 4; x > 0; x--) {
                    listaTemporal.push(Cancion[i-x]);
                }
                Cancion = Cancion.concat(listaTemporal);
            }
            compasLocal=4;
        }
        //Elegimos una nota aleatoria de la escala
        notaAleatoria = Math.floor(Math.random() * escala.length);
        Cancion [i] = escala[notaAleatoria];

        compasLocal--;
    }
}

//Funcion necesaria para el funcionamiento del sonido
function ConfigurarOscilador(nota){
    contextoAudio = new(window.AudioContext || window.webkitAudioContext)();//Contexto del audio
    oscilador = contextoAudio.createOscillator();//Oscilador del audio
    gainNode = contextoAudio.createGain(); // Nodo de ganancia (volumen)

    oscilador.type = estilo;//Tipo de onda a utilizar
    oscilador.frequency.value = nota;//Frecuencia de la nota

    oscilador.connect(gainNode);//conectar al nodo de ganancia
    gainNode.connect(contextoAudio.destination);//conectar a los parlantes
    gainNode.gain.value = 0.05;//Volumen al 5%
}
function AplicarConfiguracion()//Aplicamos las elecciones del usuario
{
    bpm = campoBPM.value;
    bpm_seg = 60/bpm;
    bpm_decseg = bpm_seg*10;
    bpm_miliseg = bpm_seg*1000;

    estilo = campoEstilo.value;
    let index = campoNota.value;
    let notaElegida = notasBase[index];
    crearEscala(campoTipoEscala,notaElegida);
    ConfigurarOscilador(notaElegida);
    
}

function ReproducirCancion()//Reproducimos la cancion formada
{
    AplicarConfiguracion();//Aplicar la configuracion del usuario
    CrearCancionAleatoria(escalaFormada);//Creamos la cancion
    let indiceNota = 0;
    let compasLocal = 0;
    let audioSonando = false;
    if (!audioSonando)
    {
        function Reproducir() {//Reproducimos la cancion
            if (indiceNota < Cancion.length) {
                compasLocal++;
                var nota = Cancion[indiceNota];
                if(compasLocal==2 || compasLocal == 4)
                {
                    ReproducirPercusion(bpm_decseg,nota);
                }
                var oscilador = contextoAudio.createOscillator();
                oscilador.type = estilo;
                oscilador.frequency.value = nota;
                oscilador.connect(gainNode);
                oscilador.start();
                oscilador.stop(contextoAudio.currentTime + bpm_seg);
                indiceNota++;
                if(compasLocal==4){compasLocal=0;}

                setTimeout(Reproducir, bpm_miliseg); 
            } else {
                audioSonando = false;
                indiceNota = 0;
            }
        }

        audioSonando = true;
        Reproducir();
    }
}

//Intento de percusion
function ReproducirPercusion(duracion,frecuencia) {
    let tipoPercusion = campoTipoPercusion.value;
    let estilo;
    let volumen;

    if(tipoPercusion!=3){
        if(tipoPercusion==0)
        {
            frecuencia /=2;
            estilo = "square";
            duracion /=4;
            volumen = 0.1;
        }
        else if(tipoPercusion==1)
        {
            frecuencia *=2;
            estilo = "triangle";
            duracion = duracion;
            volumen = 0.1;
        }
        else if(tipoPercusion==2)
        {
            frecuencia *=4;
            estilo = "sawtooth";
            duracion = duracion/8;
            volumen = 0.07;
        }
        let oscilador = contextoAudio.createOscillator();
        let envelope = contextoAudio.createGain();
    
        oscilador.type = estilo; // Puedes experimentar con diferentes formas de onda (e.g., 'sine', 'square', 'sawtooth', 'triangle')
        oscilador.frequency.value = frecuencia; // Frecuencia del sonido de percusión
        oscilador.connect(envelope);
        envelope.connect(contextoAudio.destination);
    
        envelope.gain.setValueAtTime(volumen, contextoAudio.currentTime);
        envelope.gain.exponentialRampToValueAtTime(0.001, contextoAudio.currentTime + duracion); // Decaimiento exponencial del sonido
    
        oscilador.start(contextoAudio.currentTime);
        oscilador.stop(contextoAudio.currentTime + duracion);
    }
    
}