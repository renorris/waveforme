import * as React from "react";
import FormRange from "react-bootstrap/esm/FormRange"
import Button from "react-bootstrap/esm/Button";
import Container from "react-bootstrap/esm/Container";
import WaveSurfer from "wavesurfer.js";

class Designer extends React.Component {

    state: {
        containerWidth: number | undefined,
        containerHeight: number | undefined,
        waveformHeightMultiplier: number,
        playing: boolean,
        wavesurfer: WaveSurfer | undefined,
        audioData: string,
        wavesurferOptions: {
            barGap: number | undefined,
            barWidth: number | undefined,
            barHeight: number | undefined,
            normalize: boolean,
        }
    }

    constructor(props: any) {
        super(props);

        this.state = {
            containerWidth: undefined,
            containerHeight: undefined,
            waveformHeightMultiplier: 0.5,
            playing: false,
            wavesurfer: undefined,
            audioData: "https://wavesurfer-js.org/example/media/demo.wav",
            wavesurferOptions: {
                barGap: 1,
                barWidth: 1,
                barHeight: 1,
                normalize: false,
            }
        }
    }

    componentDidMount() {
        console.log("running DidMount...")

        this.state.containerWidth = document.getElementsByClassName("waveformParentContainer")[0].clientWidth;
        this.state.containerHeight = document.getElementsByClassName("waveformParentContainer")[0].clientHeight;

        // Set to static 0.5 for now. Equals height / width of waveform container. Suspect this will change depending on the background piece being designed on.
        this.state.waveformHeightMultiplier = 0.5;

        this.state.wavesurfer = this.generateWavesurfer(document.getElementById("waveform") as HTMLElement);
        this.state.wavesurfer.load(this.state.audioData);

        // Hacky for now TODO: fix
        this.setState(Object.assign({}, this.state));
    };

    componentDidUpdate() {
        this.state.containerWidth = document.getElementsByClassName("waveformParentContainer")[0].clientWidth;
        this.state.containerHeight = document.getElementsByClassName("waveformParentContainer")[0].clientHeight;
    }

    componentWillUnmount() {
        console.log('WillUnmounting...')
        this.state.wavesurfer?.destroy();
    }

    generateWavesurfer = (container: HTMLElement) => {
        let wavesurferParams = {
            barHeight: this.state.wavesurferOptions.barHeight,
            barWidth: this.state.wavesurferOptions.barWidth,
            barGap: this.state.wavesurferOptions.barGap,
            normalize: this.state.wavesurferOptions.normalize,
            cursorWidth: 0,
            container: container,
            backend: 'WebAudio',
            closeAudioContext: true,
            responsive: true,
            progressColor: '#2D5BFF',
            waveColor: '#000000',
            height: (this.state.containerWidth as number * this.state.waveformHeightMultiplier * 1),
        }

        return WaveSurfer.create(wavesurferParams as any);
    }

    reloadWavesurfer = () => {
        //create a container for the new waveform
        let newWaveformContainer = document.createElement("div");
        newWaveformContainer.style.display = "none";
        document.getElementById("waveformParentContainer")?.appendChild(newWaveformContainer);

        //create a new instance of wavesurfer
        let newWavesurfer = this.generateWavesurfer(newWaveformContainer);

        //load the audio file
        newWavesurfer.load(this.state.audioData);

        //wait for the new waveform to be rendered 
        newWavesurfer.once("ready", () => {
            // Log for status
            console.log("Running READY...");

            // Get the parent container we're working with
            let waveformParentContainer = document.getElementById("waveformParentContainer") as HTMLElement;

            // Get the "old" waveform container to get rid of
            let oldWaveformContainer = document.getElementById("waveform") as HTMLElement;
            
            // Empty it
            oldWaveformContainer.innerHTML = "";

            // Append the new container to the parent container
            waveformParentContainer.appendChild(newWaveformContainer);

            // Remove display style to make it visible
            newWaveformContainer.style.display = "block";

            // Set ID so next time we can find this element
            newWaveformContainer.id = "waveform";

            // Kill old container
            oldWaveformContainer.remove();

            // Since wavesurfer doesn't draw when display: none, we need to draw the buffer we made to display the waveform
            newWavesurfer.drawBuffer();

            // Kill old wavesurfer
            this.state.wavesurfer?.destroy();

            // Re-set wavesurfer to our new one
            this.state.wavesurfer = newWavesurfer;
        });
    }

    handlePlay = () => {
        this.state.containerWidth = document.getElementsByClassName("waveformContainer")[0].clientWidth;
        this.state.containerHeight = document.getElementsByClassName("waveformContainer")[0].clientHeight;
        this.setState({ playing: !this.state.playing });
        this.state.wavesurfer?.playPause();
    };

    handleNormalizeButtonPress = () => {
        let newState = Object.assign({}, this.state);
        newState.wavesurferOptions.normalize = !this.state.wavesurferOptions.normalize;
        this.setState(newState);

        this.reloadWavesurfer();
    }

    handleBarHeightRangeChange = (value: number) => {
        let newState = Object.assign({}, this.state);
        newState.wavesurferOptions.barHeight = value;
        this.setState(newState);

        this.reloadWavesurfer();
    }

    handleBarWidthRangeChange = (value: number) => {
        let newState = Object.assign({}, this.state);
        newState.wavesurferOptions.barWidth = value;
        this.setState(newState);

        this.reloadWavesurfer();
    }

    handleBarGapRangeChange = (value: number) => {
        let newState = Object.assign({}, this.state);
        newState.wavesurferOptions.barGap = value;
        this.setState(newState);

        this.reloadWavesurfer();
    }

    render() {
        return (
            <Container fluid className="designerContainer d-flex flex-column justify-content-center align-items-center mx-0 px-2">
                <div
                    id="waveformParentContainer"
                    className="waveformParentContainer d-flex flex-column mx-2"
                    style={{ width: '100%', maxWidth: '512px', }}
                >
                    <div id="waveform" />
                </div>
                <Container className="controlsRowFlexContainer mt-3 d-flex flex-row gap-2 justify-content-start align-items-start" style={{maxWidth: '512px'}}>
                    <Container className="switchControlsFlexContainer d-flex flex-column gap-2 justify-content-start align-items-start">
                        <Button
                            variant={this.state.wavesurferOptions.normalize ? "success" : "outline-danger"}
                            onClick={this.handleNormalizeButtonPress}
                        >Normalize</Button>
                    </Container>
                    <Container className="rangeControlsFlexContainer d-flex flex-column gap-2 justify-content-start align-items-start">
                        <div>Intensity - {this.state.wavesurferOptions.normalize ? "Normalized" : this.state.wavesurferOptions.barHeight}</div>
                        <FormRange id="barHeightRange" min="1" max="5" defaultValue="1" step="0.1" disabled={this.state.wavesurferOptions.normalize} onChange={(event) => this.handleBarHeightRangeChange(parseFloat(event.target.value))} />
                        <div>Width - {this.state.wavesurferOptions.barWidth}</div>
                        <FormRange id="barWidthRange" min="1" max="15" defaultValue="1" step="0.1" onChange={(event) => this.handleBarWidthRangeChange(parseFloat(event.target.value))} />
                        <div>Spacing - {this.state.wavesurferOptions.barGap}</div>
                        <FormRange id="barGapRange" min="1" max="10" defaultValue="1" step="0.1" onChange={(event) => this.handleBarGapRangeChange(parseFloat(event.target.value))} />
                    </Container>
                </Container>
            </Container>
        );
    }
}

export default Designer;