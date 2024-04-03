var campoBPM = document.getElementById("BPM");//BMM
var campoEstilo = document.getElementById("estilo");
var campoCompas = document.getElementById("compas");

var estilo = campoEstilo.value;
var contextoAudio;
var oscilador;
var gainNode;
var audioConfigurado = false;
var audioSonando = false;

var bpm = campoBPM.value;
var compas = 4;
var bpm_seg = 60/bpm;
//bpm_seg/=compas;
var bpm_decseg = bpm_seg*10;
var bpm_miliseg = bpm_seg*1000;

var Do_nota = 130.8128;
var octava = [130.8128];




function AplicarConfiguracion()
{
    bpm = campoBPM.value;
    //bpm /=compas;
    bpm_seg = 60/bpm;
    bpm_decseg = bpm_seg*10;
    bpm_miliseg = bpm_seg*1000;

    estilo = campoEstilo.value;
}
function ConfigurarAudio()
{
    contextoAudio = new(window.AudioContext || window.webkitAudioContext)();//Contexto del audio
    oscilador = contextoAudio.createOscillator();//Oscilador del audio
    gainNode = contextoAudio.createGain(); // Nodo de ganancia (volumen)

    oscilador.type = estilo;//Tipo de onda a utilizar
    oscilador.frequency.value = Do_nota;//Frecuencia de la nota

    oscilador.connect(gainNode);//conectar al nodo de ganancia
    gainNode.connect(contextoAudio.destination);//conectar a los parlantes
    gainNode.gain.value = 0.05;//Volumen al 5%

    audioConfigurado = true;
}

function CrearOctava()
{
    octava = [Do_nota];
    var nota = Do_nota;
    for (let index = 0; index < 12; index++) 
    {
        nota=nota*(2**(1/12));
        octava.push(nota);
    }
    console.log(octava);
    console.log(octava.length);
}
CrearOctava();

function Nota()
{
    if(!audioConfigurado){ConfigurarAudio();}
    if (!audioSonando)
    {
        oscilador = contextoAudio.createOscillator();
        oscilador.type = estilo;
        oscilador.frequency.value = Do_nota;
        oscilador.connect(gainNode);
        oscilador.start();
        audioSonando = true;
        setTimeout(function(){oscilador.stop(),audioSonando = false}, 400);
    }
}

function ActivarOctava()
{
    var indiceNota = 0;
    if(!audioConfigurado){ConfigurarAudio();}
    if (!audioSonando)
    {
        function reproducirNota() {
            if (indiceNota < octava.length) {
                var nota = octava[indiceNota];
                var oscilador = contextoAudio.createOscillator();
                oscilador.type = estilo;
                oscilador.frequency.value = nota;
                oscilador.connect(gainNode);
                oscilador.start();
                oscilador.stop(contextoAudio.currentTime + bpm_seg);
                indiceNota++;
                setTimeout(reproducirNota, bpm_miliseg); 
            } else {
                audioSonando = false;
                indiceNota = 0;
            }
        }

        audioSonando = true;
        reproducirNota();
    }
}
