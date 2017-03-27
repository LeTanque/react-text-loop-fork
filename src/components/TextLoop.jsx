import React from "react";
import { TransitionMotion, spring } from "react-motion";
import { css } from "glamor";

class TextLoop extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            currentWord: 0,
            wordCount: 0,
            width: props.initialWidth,
            height: props.initialHeight,
        };
    }

    componentDidMount() {
        this.setDefaultWidth();
        this.tickInterval = setInterval(this.tick, this.props.speed);
    }

    componentWillUnmount() {
        clearInterval(this.tickInterval);
    }

    willLeave = () => {
        const { height } = this.getDimensions();

        return {
            opacity: spring(0),
            translate: spring(-height),
        };
    };

    willEnter = () => {
        const { height } = this.getDimensions();

        return {
            opacity: 0,
            translate: height,
        };
    }

    setDefaultWidth() {
        const { height, width } = this.getDimensions();

        this.setState(() => {
            return {
                width,
                height,
            };
        });
    }

    tick = () => {
        this.setState((state, props) => {
            return {
                currentWord: (state.currentWord + 1) % React.Children.count(props.children),
                wordCount: (state.wordCount + 1) % 1000, // just a safe value to avoid infinite counts
            };
        });
    };

    getDimensions() {
        if (this.wordBox == null) {
            return this.state;
        }

        return this.wordBox.getBoundingClientRect();
    }

    getStyles() {
        const { height } = this.getDimensions();
        return css(
            this.props.style,
            {
                display: "inline-block",
                position: "relative",
                verticalAlign: "top",
                height,
            },
        );
    }

    getTextStyles() {
        return css({
            whiteSpace: "nowrap",
            display: "inline-block",
            position: "absolute",
            left: 0,
            top: 0,
        });
    }

    getTransitionMotionStyles() {
        const { children, springConfig } = this.props;
        const { wordCount, currentWord } = this.state;
        const options = React.Children.toArray(children);

        return [
            {
                key: `step${wordCount}`,
                data: {
                    text: options[currentWord],
                },
                style: {
                    opacity: spring(1, springConfig),
                    translate: spring(0, springConfig),
                },
            },
        ];
    }

    render() {
        // Show first child while it's loading
        if (this.state.width === 0) {
            const children = React.Children.toArray(this.props.children)[0];
            return (
                <span ref={(n) => { this.wordBox = n; }}>
                    {children}
                </span>
            );
        }

        return (
            <div {...this.getStyles()}>
                <TransitionMotion
                    willLeave={this.willLeave}
                    willEnter={this.willEnter}
                    styles={this.getTransitionMotionStyles()}
                >
                    {
                        (interpolatedStyles) => {
                            const { height, width } = this.getDimensions();

                            return (
                                <div
                                    style={{
                                        transition: `width ${this.props.adjustingSpeed}ms linear`,
                                        height,
                                        width,
                                    }}
                                >
                                    {
                                        interpolatedStyles.map(
                                            (config) => (
                                                <div
                                                    {...this.getTextStyles()}
                                                    ref={(n) => { this.wordBox = n; }}
                                                    key={config.key}
                                                    style={{
                                                        opacity: config.style.opacity,
                                                        transform: `translateY(${config.style.translate}px)`,
                                                    }}
                                                >
                                                    {config.data.text}
                                                </div>
                                            )
                                        )
                                    }
                                </div>
                            );
                        }
                    }
                </TransitionMotion>
            </div>
        );
    }
}

TextLoop.propTypes = {
    speed: React.PropTypes.number.isRequired,
    adjustingSpeed: React.PropTypes.number.isRequired,
    initialWidth: React.PropTypes.number.isRequired,
    initialHeight: React.PropTypes.number.isRequired,
    style: React.PropTypes.object,
    springConfig: React.PropTypes.object.isRequired,
    children: React.PropTypes.node.isRequired,
};

TextLoop.defaultProps = {
    speed: 3000,
    adjustingSpeed: 150,
    springConfig: { stiffness: 340, damping: 30 },
    initialWidth: 0,
    initialHeight: 0,
};

export default TextLoop;