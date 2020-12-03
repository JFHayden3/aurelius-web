import React, { useState, Component } from "react";
import { Row, Col, Typography, Button, Modal } from "antd";
import { AuthModal } from '../components/AuthModal'
import { random } from "lodash";
const { Title, Text, Paragraph } = Typography;

const growText = "Define your goals, set your routines, draw your boundaries, and examine your short-comings. No matter where you are in life or what kind of changes you want to make, Rise Write will give you the tools you need to delve inwards, uncover your true self, to get out of your own way, and manifest more of your potential. It all comes down to self-directed growth and personal accountability: deep down, YOU know when you are not living up to everything you could be. Learn to unify your intentions and actions and start living your best life today!"
const oneDayText = "Start off each day on the right foot with customizable journaling exercises designed to get the words flowing fast and productively. Your daily writing will become the foundation from which you can make other changes in your life such as breaking away from bad behaviors, forming new habits, deepening your interpersonal relationships, or becoming more creative. The person you've always wanted to be is within your reach, it just takes simple daily persistence. Rise Write is built to be your companion in this process."
const technologyText = "Storage, organization, search, filtering, export, customization, and analysis: with Rise Write you won't just be writing in an ordinary journal, you will be building a personal encyclopedia -- a map of your inner self. Built by journalers for journalers (or would-be journalers): say 'goodbye' to disorganized pages and scattered notebooks and 'hello' to the future."

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
  // William James
  "The greatest discovery of any generation is that a human can alter his life by altering his attitude.",
  "Seek out that particular mental attribute which makes you feel most deeply and vitally alive, along with which comes the inner voice which says, 'This is the real me,' and when you have found that attitude, follow it.",
  "Be not afraid of life. Believe that life is worth living, and your belief will help create the fact.",
  "If you can change your mind, you can change your life.",
];

class CyclingQuote extends Component {
  constructor(props) {
    super(props);
  }

  async componentDidMount() {
    this.handle = setInterval(() => {
      const lastQuoteIndex = this.state.currentQuoteIndex;
      const currentQuoteIndex = this.state.unpickedQuotes[random(0, this.state.unpickedQuotes.length - 1)];
      const counter = this.state.counter + 1;
      const unpickedQuotes = this.state.unpickedQuotes.length > 1
        ? this.state.unpickedQuotes.filter(v => v !== currentQuoteIndex)
        : quoteCycleOptions.map((v, i) => i)
      this.setState({ lastQuoteIndex, currentQuoteIndex, unpickedQuotes, counter });
    }, 7000);
  }

  async componentWillUnmount() {
    clearInterval(this.handle);
  }

  state = {
    currentQuoteIndex: random(0, quoteCycleOptions.length - 1),
    lastQuoteIndex: random(0, quoteCycleOptions.length - 1),
    unpickedQuotes: quoteCycleOptions.map((v, i) => i),
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
            transition: "700ms linear",
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
            transition: "700ms linear",
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
  const colStyle = { textAlign: "center", width: "33.3333%" };
  const boxHeaderStyle = { fontSize: "18px" };
  const boxContentStyle = { fontSize: "12px" };
  const [authModalMode, setAuthModalMode] = useState('HIDDEN')
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
        <Text style={{ fontSize: "24px" }}>Rise Write</Text>
        <div style={{ float: "right", marginTop: "5px" }}>
          <Text style={{ fontSize: "10px" }}>Already have an account?</Text>
          <Button
            style={{ fontSize: "10px" }}
            type="link"
            onClick={() => setAuthModalMode('SIGN_IN')}
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
            onClick={() => setAuthModalMode('SIGN_UP')}
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
        wrap="false"
        gutter={{ xs: 8, sm: 16, md: 24 }}
        style={{ width: "98%" }}
      >
        <Col flex={1} style={colStyle}>
          <Text style={boxHeaderStyle}>Grow towards your best self</Text>
          <Paragraph style={boxContentStyle}>{growText}</Paragraph>
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
            {oneDayText}
          </Paragraph>
        </Col>
        <Col flex={1} style={colStyle}>
          <Text style={boxHeaderStyle}>With help from technology</Text>
          <Paragraph style={boxContentStyle}>{technologyText}</Paragraph>
        </Col>
      </Row>
      <Modal destroyOnClose
        visible={authModalMode !== 'HIDDEN'}
        onCancel={e => setAuthModalMode('HIDDEN')}
        footer={null}>
        <AuthModal initialMode={authModalMode} />
      </Modal>
    </div>
  );
};
