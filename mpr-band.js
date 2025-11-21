// @ts-check

class MprBand extends HTMLElement {
    constructor() {
        super();
        const shadowRoot = this.attachShadow({mode: "open"});
        shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    position: relative;
                    width: 100vw;
                    margin: 0;
                    padding: 0;
                }
                ::slotted(*) {
                    display: block;
                }
            </style>
            <slot></slot>
        `;
    }
}

customElements.define("mpr-band", MprBand);
