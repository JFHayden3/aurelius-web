import React, { useState, Component } from "react";
import { Space, Row, Col, Typography, Divider, Button } from "antd";
import { Auth } from "aws-amplify";
import { random } from "lodash";
const { Title, Text, Paragraph } = Typography;

const quoteCycleOptions = [
  // Jung
  "The shoe that fits one person pinches another; there is no recipe for living that suits all cases.",
  "Every human life contains a potential, if that potential is not fulfilled, then that life was wasted...",
  "Your visions will become clear only when you can look into your own heart. Who looks outside, dreams; who looks inside, awakes.",
  "I am not what happened to me, I am what I choose to become.",
  "You are what you do, not what you say you'll do.",
  "The privilege of a lifetime is to become who you truly are.",
  // Rogers
  "The good life is a process, not a state of being. It is a direction not a destination.",
  "once an experience is fully in awareness, fully accepted, then it can be coped with effectively, like any other clear reality.",
  "Today we have abundant opportunities to utilize our strengths and passions, do things we enjoy, and connect with people we love.Tomorrow might bring a world of exciting new possibilities, but today, wherever we stand on our journey, can be an adventure in itself.",
  "Am I living in a way which is deeply satisfying to me, and which truly expresses me?",
  // Frankl
  "Man does not simply exist but always decides what his existence will be, what he will become the next moment. By the same token, every human being has the freedom to change at any instant.",
  "For the world is in a bad state, but everything will become still worse unless each of us does his best.",
  "Man is not fully conditioned and determined but rather determines himself whether he gives in to conditions or stands up to them.",
  "Human potential at its best is to transform a tragedy into a personal triumph, to turn one's predicament into a human achievement",
];

class CyclingQuote extends Component {
  constructor(props) {
    super(props);
  }

  async componentDidMount() {
    this.handle = setInterval(() => {
      const lastQuoteIndex = this.state.currentQuoteIndex;
      const currentQuoteIndex = random(0, quoteCycleOptions.length - 1);
      const counter = this.state.counter + 1;
      this.setState({ lastQuoteIndex, currentQuoteIndex, counter });
    }, 5000);
  }

  async componentWillUnmount() {
    clearInterval(this.handle);
  }

  state = {
    currentQuoteIndex: random(0, quoteCycleOptions.length - 1),
    lastQuoteIndex: random(0, quoteCycleOptions.length - 1),
    counter: 0,
  };

  render() {

    const firstQuoteInd = this.state.counter % 2 === 0 ? this.state.currentQuoteIndex : this.state.lastQuoteIndex
    const secondQuoteInd = this.state.counter % 2 !== 0 ? this.state.currentQuoteIndex : this.state.lastQuoteIndex
    const firstOpacity = this.state.counter % 2 === 0 ? '100%' : '0%'
    const secondOpacity = this.state.counter % 2 !== 0 ? '100%' : '0%'
    return (
      <div>
        <Paragraph
          style={{
            fontStyle: "italic",
            fontSize: "12px",
            color: "gray",
            height: '20px',
            marginBottom: '-20px',
            transition: "500ms linear",
            opacity: firstOpacity
          }}
        >
          "{quoteCycleOptions[firstQuoteInd]}"
        </Paragraph>
        <Paragraph
          style={{
            fontStyle: "italic",
            fontSize: "12px",
            color: "gray",
            height: '20px',
            transition: "500ms linear",
            opacity: secondOpacity
          }}
        >
          "{quoteCycleOptions[secondQuoteInd]}"
        </Paragraph>
      </div>
    );
  }
}

export const LandingPage = () => {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState();
  const colStyle = { textAlign: "center", width: "33.3333%" };
  const boxHeaderStyle = { fontSize: "18px" };
  const boxContentStyle = { fontSize: "12px" };
  const tempFillerText =
    "alsdkfj aosfj awieofj asefj aiofj slkdkfj osiadhf aiosfh aoshfoasjf oiwaefjcowejfcoia wjefcoiawjefcoawjfjf  fjaowejfcawiefjcawfc asdf asofj aiwofej alskfj owiaefj wlaejf ioawef oiawjf ioawjfio jweofijawoiefjoiawjcfoiaj oaijf oiawjf ioawejf oiawjf oiawjf ioawjef iojawfoi jwaofi jwoifj awoijf awoijf lsakjf oiasjf oiahfoiajf oiaejofi jwaioefj awoijf oiawjf aw.";
  return (
    <div style={{ fontFamily: "sans-serif" }}>
      <div
        style={{
          width: "100%",
          paddingBottom: "5px",
          paddingLeft: "12px",
          boxShadow: "0px 0px 10px 0px grey",
        }}
      >
        <Text style={{ fontSize: "24px" }}>Kaizen Daily</Text>
        <div style={{ float: "right", marginTop: "5px" }}>
          <Text style={{ fontSize: "10px" }}>Already have an account?</Text>
          <Button
            style={{ fontSize: "10px" }}
            type="link"
            onClick={() => Auth.federatedSignIn()}
          >
            login
          </Button>
        </div>
      </div>
      <div
        style={{
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          height: "30vh",
          resize: "vertical",
          overflow: "auto",
        }}
      >
        <div>
          <Text style={{ fontSize: "22px" }}>
            Start writing your way to a better life today
          </Text>
          <Button
            style={{ fontSize: "22px" }}
            type="link"
            onClick={() => Auth.federatedSignIn()}
          >
            sign up now!
          </Button>
        </div>
      </div>
      <div
        style={{
          paddingLeft: "25vw",
          paddingRight: "25vw",
          textAlign: "center",
          marginTop: "10vh",
          marginBottom: "17vh",
        }}
      >
        <CyclingQuote />
      </div>
      <Row
        wrap={false}
        gutter={{ xs: 8, sm: 16, md: 24 }}
        style={{ width: "98%" }}
      >
        <Col flex={1} style={colStyle}>
          <Text style={boxHeaderStyle}>Grow towards your best self</Text>
          <Paragraph style={boxContentStyle}>{tempFillerText}</Paragraph>
        </Col>
        <Col flex={1} style={colStyle}>
          <Text style={boxHeaderStyle}>One day at a time</Text>
          <Paragraph
            style={{
              ...boxContentStyle,
              borderRightStyle: "inset",
              paddingRight: "6px",
              borderLeftStyle: "outset",
              paddingLeft: "6px",
            }}
          >
            {tempFillerText}
          </Paragraph>
        </Col>
        <Col flex={1} style={colStyle}>
          <Text style={boxHeaderStyle}>With help from technology</Text>
          <Paragraph style={boxContentStyle}>{tempFillerText}</Paragraph>
        </Col>
      </Row>
    </div>
  );
};
