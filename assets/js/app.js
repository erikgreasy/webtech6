
class AmplitudeChanger extends HTMLElement {
    connectedCallback() {
        console.log('connected')  
        // this.attachShadow({mode: 'open'});      
        this.innerHTML = `
        
        <div class="row">
        <div class="col-sm-12 col-lg-6">
            <div class="form-group">

                <input type="checkbox" id="numCheck">            
                <label for="numCheck">Number</label>
                <input type="number" class="form-control hide" value="1" id="numInput" min="0" max="5">
            </div>

        </div>
        <div class="col-sm-12 col-lg-6">
            
            <div class="form-group">

                <input type="checkbox" id="sliderCheck">
                <label for="sliderCheck">Slider</label>
                <input type="range" class="custom-range hide" id="sliderInput" min="0" max="5" value="1">
            </div>
        </div>
    </div>
    `
        const numInput = this.querySelector('#numInput')
        const sliderInput = this.querySelector( '#sliderInput' )
        const sliderCheck = this.querySelector( '#sliderCheck' )
        const numCheck = this.querySelector( '#numCheck' )

        sliderCheck.addEventListener( 'change', function() {
            sliderInput.classList.toggle( 'hide' )
        } )
        numCheck.addEventListener( 'change', function() {
            numInput.classList.toggle('hide')
        } )
        
        
        sliderInput.addEventListener('change', function() {
            numInput.value = this.value
        })
        numInput.addEventListener('change', function() {
            if( this.value > 5 ) {
                this.value = 5
            } else if( this.value < 0 ) {
                this.value = 0
            }
            sliderInput.value = this.value
        })
    }

}

customElements.define('amplitude-changer', AmplitudeChanger);

if(typeof(EventSource) !== "undefined") {
    var source = new EventSource("http://vmzakova.fei.stuba.sk/sse/sse.php");
    TESTER = document.getElementById('tester');
    var trace1 = {
        x: [0],
        y: [0],
        type: 'scatter'
    }
    var trace2 = {
        x: [0],
        y: [0],
        type: 'scatter'
    }
    var data = [trace1, trace2]
    maxY = 1
    minY = 0
    var layout = {
        xaxis: {range: [0, 1]},
        yaxis: {range: [minY - 0.5, maxY + 0.5 ]}
    };
    Plotly.newPlot(TESTER, data, layout);

    source.addEventListener("message", handleNewData)
    
    const numInput = document.querySelector('#numInput')
    const endBtn = document.querySelector( '#endBtn' )
    const showFirstLine = document.querySelector('#showFirstLine')
    const showSecondLine = document.querySelector('#showSecondLine')
    const lines = Array.from( document.querySelectorAll('.plot .trace') )
    const firstLine = lines[0]
    const secondLine = lines[1]
    showFirstLine.addEventListener('change', function() {
        firstLine.classList.toggle('hide')
    })
    showSecondLine.addEventListener('change', function() {
        secondLine.classList.toggle('hide')
    })
    endBtn.addEventListener('click', function() {
        source.removeEventListener('message', handleNewData )
        this.disabled = true
        console.log('ended')
    })

    
} else {
    console.log( 'event service undefined' )
}


function handleNewData(e) {
    let ampl = numInput.value
    if( ampl > 5 ) {
        ampl = 5
    } else if( ampl < 0 ) {
        ampl = 0
    }
    var incomingData = JSON.parse(e.data);
    var y1 = parseFloat(incomingData.y1) * ampl
    var y2 = parseFloat(incomingData.y2) * ampl
    console.log(y2)
    if( y2 >= maxY ) {
        maxY = parseFloat(y2)
    } else if( y1 >= maxY ) {
        maxY = parseFloat(y1)

    }

    if( y2 <= minY ) {
        minY = parseFloat( y2 )
    } else if( y1 <= minY ) {
        minY = parseFloat( y1 )
    }
    var max = parseInt( incomingData.x ) + 1
    console.log(incomingData)
    trace1.x.push( incomingData.x )
    trace1.y.push( incomingData.y1 * ampl )
    trace2.x.push( incomingData.x )
    trace2.y.push( incomingData.y2 * ampl )
    Plotly.animate(TESTER, {
        data: data,
        traces: trace1,
        layout: {
            xaxis: {range: [0, max]},
            yaxis: {range: [minY - 0.5, maxY+0.5]}
        }
    }, {
        transition: {
          duration: 500,
          easing: 'cubic-in-out'
        },
        frame: {
          duration: 500
        }
      })
   
}

