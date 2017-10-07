import React from 'react';
import ReactDOM from 'react-dom';

import './gioco2048.css';

const elements = 4;
const celle = [2];
const UP = 38;
const DOWN = 40;
const RIGHT = 39;
const LEFT = 37;
const debug = false;
const tempo = 100;

let lock_event = false;



class GameHeader extends React.Component{
    render(){
        return(
                <div className="game-header">
                    <div className="title">2048</div>
                    <div className="pulsanti left">
                        <NuovoGioco newgame={this.props.newgame}/>
                    </div>
                    <div className="punteggi right">
                        <Punteggio titolo="punteggio" punti={this.props.punti}/>
                        <Punteggio titolo="record" punti={this.props.massimo} />
                    </div>
                    <div className="clear"></div>
                </div>
        );
    }
}

class Punteggio extends React.Component{
    render(){
        return(
                <div className="punteggio">
                    <span className="titolo">{this.props.titolo}</span>
                    <br/>
                    <span className="valore">{this.props.punti}</span>
                </div>
        );
    }
};

class NuovoGioco extends React.Component{
    render(){
        return(
            <button onClick={this.props.newgame} className="button primary-button button-reset">Nuovo gioco</button>
        );
    }
};


class Gioco extends React.Component{
    constructor(){
        super();
        this.state = {
            metadata: {
                movimenti: [],
                unioni: [],
                ultimamossa: null
            },
            massimo: 0
        };
        this.handleClick = this.handleClick.bind(this);
        document.addEventListener("keydown",this.handleArrowClick.bind(this));
        this.handleClick = this.handleClick.bind(this);
    }
        
    componentWillMount(){
        let tabellone =  Array(4).fill(0);
        tabellone.map( (a,i) => {
            tabellone[i] = Array(4).fill(0);
        });
        addCellaRandom(tabellone);
        addCellaRandom(tabellone);
        this.setState({
            tabellone:tabellone,
            liberi: 14,
            punti: 0,
            metadata: {
                movimenti: [],
                unioni: [],
                ultimamossa: null
            }
        });
    }
    
    calcoloLibere(tabellone){
        let libere = 0;
        tabellone.map( (x,i) => {
           x.map( (x2,i2) => {
               if(x2 === 0)libere++;
           });
        });
        return libere;
    }
    
    handleArrowClick(e){
        if(!lock_event && e.keyCode === UP || e.keyCode === DOWN || e.keyCode === LEFT || e.keyCode === RIGHT){
            let tabellone = copiaArray(this.state.tabellone);
            //alert("Evento click"+e.keyCode);
            let result = null;
            switch(e.keyCode){
                case UP:
                    //if(controllaCombinazioni(tabellone,muoviSopra,'y','left'))libere = addCellaRandom(tabellone);
                    result = muoviSopra(tabellone);
                    //controllaCombinazioni(tabellone,muoviSopra,'y','left')
                    break;
                case DOWN:
                    result = muoviSotto(tabellone);
                    //if(controllaCombinazioni(tabellone,muoviSotto,'y','right'))libere = addCellaRandowm(tabellone);
                    //controllaCombinazioni(tabellone,muoviSotto,'y','right')
                    break;
                case LEFT:
                    result = muoviSinistra(tabellone);
                    //controllaCombinazioni(tabellone,muoviSinistra,'x','left')
                    break;
                case RIGHT:
                    result = muoviDestra(tabellone);
                    //controllaCombinazioni(tabellone,muoviSinistra,'x','left')
                    break;
            }
            if(result.modifiche === true){
                addCellaRandom(tabellone);
            }
            let libere = this.calcoloLibere(tabellone);
            let tab2 = copiaArray(tabellone);
            
            let massimo = this.state.massimo;
            let punti = this.state.punti + result.punti;
            if(massimo < punti)massimo = punti;
            this.setState({
                tabellone: this.state.tabellone,
                liberi: this.state.liberi,
                punti : punti,
                massimo: massimo,
                metadata: {
                    movimenti: result.movimenti,
                    unioni: result.unioni,
                    ultimamossa: e.keyCode
                }
            });

            lock_event = true;
            window.setTimeout( () => {
                this.setState({
                    tabellone:tabellone,
                    liberi:libere,
                    metadata: {
                        movimenti: null,
                        unioni: null,
                        ultimamossa: null
                    }
                });

                if(libere === 0 && this.state.liberi === 0){
                    if(!muoviSopra(tab2).modifiche && !muoviSotto(tab2).modifiche){
                        if(!muoviSinistra(tab2).modifiche && !muoviDestra(tab2).modifiche){
                            window.setTimeout( () =>{
                                alert("HAI PERSO");

                            },500);
                        }
                    }
                }

                
                lock_event = false;
            },tempo);
            
        }
    }

    
    handleClick(event){
        let x = event.target.getAttribute('x');
        let y = event.target.getAttribute('y');
        event.preventDefault();
        let tabellone = copiaArray(this.state.tabellone);
        tabellone[x][y] = celle[getRandomInt(0,celle.length)];
        this.setState({tabellone:tabellone});
    }
    
    render(){
        return(
            <div id="game">
                <GameHeader newgame={(e) => this.componentWillMount(e)} punti={this.state.punti} massimo={this.state.massimo}/>
                <Tabellone metadata={this.state.metadata} onClick={this.handleClick} tabellone={this.state.tabellone}/>
                <div className="game-footer"></div>
            </div>
        );
    }
};




class Tabellone extends React.Component{
    render(){
        let caselle = [1,2,3,4];
        
        const tabellone = caselle.map((value,index) => {
            return (
                <div  key={index}>
                    {  
                        caselle.map((value2,index2) => 
                            <div  key={index+'-'+index2} className="casella-container">
                                <Cella metadata={this.props.metadata} onClick={this.props.onClick} x={index} y={index2} value={this.props.tabellone[index][index2]}  />
                            </div>
                        )
                    }

                </div>
            );
        });
        return(
            <div className="tabellone">
                {tabellone}
            </div> 
        );
    }
};

class Cella extends React.Component{
    render(){
        const cella = this.props.value === 0 ? '' : this.props.value;
        return <div x={this.props.x} y={this.props.y} onClick={debug ? this.props.onClick : ''} className={calculateCss(this.props.value) + " " + calculateAnimation(this.props.metadata,this.props.x,this.props.y)}>{cella}</div>;
    }
};


function calculateAnimation(metadata,x,y){
    let movimenti = metadata.movimenti;
    let unioni = metadata.unioni;
    let ultimamossa = metadata.ultimamossa;
    if(movimenti === [] || ultimamossa === null)return "";
    
    let classe = "";
    let valore = movimenti[x][y];
    if(valore > 0){
        if(ultimamossa === UP)classe = "up-"+valore;
        if(ultimamossa === DOWN)classe = "down-"+valore;
        if(ultimamossa === LEFT)classe = "left-"+valore;
        if(ultimamossa === RIGHT)classe = "right-"+valore;
    }
    if(unioni.length > 0 && unioni[x][y] > 0)classe += " unisci";
    return classe;
}


//ReactDOM.render(<Title/>,document.getElementById8('root'));



ReactDOM.render(<Gioco />,document.getElementById('root'));


function aggiornaArray(x,y,valore,array){
    let righe = array.slice();
    let riga = righe[x].slice();
    riga[y] = valore;
    righe[x] = riga;
    return righe;
}

function copiaArray(old){
    var nuovo = [];
    old.map((value,index) => {
        if(Array.isArray(value)){
            nuovo.push(copiaArray(value));
        }else{
            nuovo.push(value);
        }
    });
    return nuovo;
}


//Y rimane fisso
// si inizia a eseguire i movimenti dalla casella più alta
// Verso l'alto sale le caselle
function muoviSopra(data){ 
    let movimenti = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
    let unioni = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]; //Contiene la posizione della casella ferma che viene sommata
    let modifiche = false;
    let punti = 0;
    for(let y = 0;y < 4;y++){
        for(let x = 1;x < 4;x++){
            let z = x;
            let continua = true;
            if(data[z][y] > 0){
                //La casella ha valore
                do{
                    //Controlla casella superiore
                    if(data[z-1][y] === 0){//Muovi elemento sopra
                        data[z-1][y] = data[z][y];
                        data[z][y] = 0;
                        movimenti[x][y]++;
                        modifiche = true;
                    }else if(data[z-1][y] === data[z][y] && unioni[z-1][y] === 0 && unioni[z][y] === 0){//Unisci elemento
                        //Aggiunto controllo che non sia gia stato unito
                        punti += calcolaPunteggio(data[z-1][y]);
                        data[z-1][y] += data[z-1][y];
                        data[z][y] = 0;
                        unioni[z-1][y]++;
                        movimenti[x][y]++;
                        modifiche = true;
                    }else{ //Non può fare altre mosse
                        continua = false;
                    }
                    z--; //Step 
                }while(continua && z >= 1);
            }
        }
    }
    return {movimenti,unioni,modifiche,punti};
}


function muoviSotto(data){ 
    let movimenti = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
    let unioni = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
    let modifiche = false;
    let punti = 0;
    for(let y = 0;y < 4;y++){
        for(let x = 2;x >= 0;x--){
            let z = x;
            let continua = true;
            if(data[z][y] > 0){
                //La casella ha valore
                do{
                    //Controlla casella inferiore
                    if(data[z+1][y] === 0){//Muovi elemento sopra
                        data[z+1][y] = data[z][y];
                        data[z][y] = 0;
                        movimenti[x][y]++;
                        modifiche = true;
                    }else if(data[z+1][y] === data[z][y]  && unioni[z+1][y] === 0 && unioni[z][y] === 0){//Unisci elemento
                        //Controllo che non ha altre unioni
                        punti += calcolaPunteggio(data[z+1][y]);
                        data[z+1][y] += data[z+1][y];
                        data[z][y] = 0;
                        unioni[z+1][y]++;
                        movimenti[x][y]++;
                        modifiche = true;
                    }else{ //Non può fare altre mosse
                        continua = false;
                    }
                    z++; //Step 
                }while(continua && z <= 2);
            }
        }
    }
    return {movimenti,unioni,modifiche,punti};
}


function muoviSinistra(data){
    let movimenti = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
    let unioni = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
    let modifiche = false;
    let punti = 0;
    for(let x = 0;x < 4;x++){//Per ogni riga
        for(let y = 1;y < 4;y++){
            let z = y;
            let continua = true;
            if(data[x][z] > 0){ //La riga
                //La casella ha valore
                do{
                    //Controlla casella inferiore
                    if(data[x][z-1] === 0){//Muovi elemento sinistra
                        data[x][z-1] = data[x][z];
                        data[x][z] = 0;
                        movimenti[x][y]++;
                        modifiche = true;
                    }else if(data[x][z] === data[x][z-1]  && unioni[x][z-1] === 0 && unioni[x][z] === 0){//Unisci elemento
                        //Controllo che non ha altre unioni
                        punti += calcolaPunteggio(data[x][z-1]);
                        data[x][z-1] += data[x][z-1];
                        data[x][z] = 0;
                        unioni[x][z-1]++;
                        movimenti[x][y]++;
                        modifiche = true;
                    }else{ //Non può fare altre mosse
                        continua = false;
                    }
                    z--; //Step 
                }while(continua && z >= 1);
            }
        }
    }
    return {movimenti,unioni,modifiche,punti};
}


function muoviDestra(data){
    let movimenti = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
    let unioni = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
    let modifiche = false;
    let punti = 0;
    for(let x = 0;x < 4;x++){
        for(let y = 2;y >= 0;y--){
            let z = y;
            let continua = true;
            if(data[x][z] > 0){ //La riga
                //La casella ha valore
                do{
                    //Controlla casella inferiore
                    //console.log("X"+(z+1)+"Y"+y);
                    if(data[x][z+1] === 0){//Muovi elemento sinistra
                        data[x][z+1] = data[x][z];
                        data[x][z] = 0;
                        movimenti[x][y]++;
                        modifiche = true;
                    }else if(data[x][z+1] === data[x][z]  && unioni[x][z+1] === 0 && unioni[x][z] === 0){//Unisci elemento
                        //Controllo che non ha altre unioni
                        punti += calcolaPunteggio(data[x][z+1]);
                        data[x][z+1] += data[x][z+1];
                        data[x][z] = 0;
                        unioni[x][z+1]++;
                        movimenti[x][y]++;
                        modifiche = true;
                    }else{ //Non può fare altre mosse
                        continua = false;
                    }
                    z++; //Step 
                }while(continua && z <= 2);
            }
        }
    }
    return {movimenti,unioni,modifiche,punti};
}



/*function muoviSopra(data){
    let muovi = false;
    for(let y = 0;y < elements;y++){
        for(let x = 1;x < elements;x++){
            let z = x;
            while(z > 0 && data[z][y] > 0 && data[z-1][y] === 0){
                data[z-1][y] = data[z][y];
                data[z][y] = 0;
                z--;
                muovi = true;
            }
        }
    }
    return muovi;
}

function muoviSotto(data){
    let muovi = false;
    for(let y = 0;y < elements;y++){
        for(let x = elements-2;x >= 0;x--){
            let z = x;
            while(z < elements-1 && data[z][y] > 0 && data[z+1][y] === 0){
                data[z+1][y] = data[z][y];
                data[z][y] = 0;
                muovi = true;
                z++;
            }
        }
    }
    return muovi;
}*/

/*function muoviDestra(data){
    let muovi = false;
    for(let x = 0; x < elements; x++){
        for(let y = elements-2;y >= 0;y--){
            let z = y;
            while(z < elements-1 && data[x][z] > 0 && data[x][z+1] === 0){
                data[x][z+1] = data[x][z];
                data[x][z] = 0;
                muovi = true;
                z++;
            }
        }
    }
    return muovi;
}*/



/*function muoviSinistra(data){
    let muovi = false;
    for(let x = 0; x < elements; x++){
        for(let y = 0;y < elements;y++){
            let z = y;
            while(z > 0 && data[x][z] > 0 && data[x][z-1] === 0){
                data[x][z-1] = data[x][z];
                data[x][z] = 0;
                muovi = true;
                z--;
            }
        }
   }
   return muovi;
}*/



function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}



/*function addCellaRandom(data){
    let continua = true;
    while(continua){
        let x = getRandomInt(0,3);
        let y = getRandomInt(0,3);
        if(data[x][y] === 0){
            data[x][y] = celle[getRandomInt(0,celle.length-1)];
            continua = false;
        }
    }
    console.log(data);
}*/


//Ritorna il numero di celle libere dopo aver inserito una cella: se ritorna -1 la partita è persa
function addCellaRandom(data){
    let liberi = 0;
    data.forEach( (v,i) => {
       v.forEach( (v2,i2) => {
           if(v2 === 0)liberi++; 
       }); 
    });
    if(liberi === 0)return 0;
    let pos = getRandomInt(0,liberi);
    let cont = 0;
    let valore_cella = celle[getRandomInt(0,celle.length-1)];
    data.forEach( (v,i) => {
       v.forEach( (v2,i2) => {
           if(data[i][i2] === 0){
               if(pos === cont){
                   data[i][i2] = valore_cella;
               }
               cont++;

           }
       });
    });
    if(liberi >= 0)liberi--;
    //console.log(liberi);
    return liberi;
}

function calculateCss(val){
    switch(val){
        case 0:return "liv0";
        case 1:return "liv1";
        case 2:return "liv2";
        case 4:return "liv3";
        case 8:return "liv4";
        case 16:return "liv5";
        case 32:return "liv6";
        case 64:return "liv7";
        case 128:return "liv8";
        case 256:return "liv9";
        case 512:return "liv10";
        case 1024:return "liv11";
        case 2048:return "liv12";
        default:return "";
    }   
}

function calcolaPunteggio(cella){
    let punti = cella*2;
    return punti;
}
