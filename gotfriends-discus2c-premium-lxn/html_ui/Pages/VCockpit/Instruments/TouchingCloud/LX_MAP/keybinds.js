class Keybinds {
    constructor(instrument) {
        this.instrument = instrument;
    }

    async init() {
        const eventBus = new EventBus();

        //Get the key intercept manager
        const manager = await KeyInterceptManager.getManager(eventBus);

        //Set the AP nav hold key event to be intercepted, but still pass through to the sim
        manager.interceptKey('MAC_CREADY_SETTING_DEC', true);
        manager.interceptKey('MAC_CREADY_SETTING_INC', true);

        const subscriber = eventBus.getSubscriber();
        subscriber.on('key_intercept').handle(keyData => {
        switch (keyData.key) {
            case 'MAC_CREADY_SETTING_DEC':
            console.log('MacCready setting decreased');
            break;
            case 'MAC_CREADY_SETTING_DEC':
            console.log('MacCready setting increased');
            break;
        }
        });
    }
}