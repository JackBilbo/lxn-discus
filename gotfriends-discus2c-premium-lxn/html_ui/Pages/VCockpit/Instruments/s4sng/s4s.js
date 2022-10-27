class s4s extends BaseInstrument {
    constructor() {
        super();
    }

    get templateID() { return "s4sng"; }
    get isInteractive() { return true;}

    connectedCallback() {
        super.connectedCallback();
    }
    
    disconnectedCallback() {
        super.disconnectedCallback();
    }
}

registerInstrument("s4s-element", s4s);