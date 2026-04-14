export class ViewModel<T> {
    private getProperty;
    private setProperty;
    private listeners = new Set<(value: T) => void>();

    static forProperty<O, K extends keyof O>(object: O, key: K) {
        const getProperty = () => {
            return object[key];
        };

        const setProperty = (value: O[K]) => {
            object[key] = value;
        };

        return new ViewModel(getProperty, setProperty);
    }

    constructor(
        getProperty: () => T,
        setProperty: (value: T) => void,
    ) {
        this.getProperty = getProperty;
        this.setProperty = setProperty;
    };

    addChangeListener(action: (value: T) => void) {
        this.listeners.add(action);
    };

    get property() {
        return this.getProperty();
    };

    set property(value: T) {
        this.setProperty(value);

        for (const listener of this.listeners) {
            listener(value);
        };
    };
};