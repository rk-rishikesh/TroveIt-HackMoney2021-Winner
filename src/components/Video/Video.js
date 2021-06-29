import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import Button from "@material-ui/core/Button";
import Web3 from "web3";
import VideoMarket from "../../abis/VideoMarket.json";
import { FingerprintSpinner } from "react-epic-spinners";
import VideoCallIcon from '@material-ui/icons/VideoCall';
import IconButton from "@material-ui/core/IconButton";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";


const useStyles = (theme) => ({
  root: {
    "& > *": {
      margin: theme.spacing(1),
    },
  },
  input: {
    display: "none",
  },
});

//Declare IPFS
const ipfsClient = require("ipfs-http-client");
const ipfs = ipfsClient({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
}); // leaving out the arguments will default to these values

class Video extends Component {
  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3;
    // Load account
    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });
    // Network ID
    const networkId = await web3.eth.net.getId();
    const networkData = VideoMarket.networks[networkId];
    if (networkData) {
      const videomarket = new web3.eth.Contract(VideoMarket.abi, networkData.address);
      this.setState({ videomarket });
      const videosCount = await videomarket.methods.videoCount().call();
      this.setState({ videosCount });

      // Load videos, sort by newest
      for (var i = videosCount; i >= 1; i--) {
        const video = await videomarket.methods.videos(i).call();
        this.setState({
          videos: [...this.state.videos, video],
        });
      }
      
        const response = await videomarket.methods.checkBalance().call({from: this.state.account })
          console.log(response);
          this.setState({balance: response})

      //Set latest video with title to view as default
      const latest = await videomarket.methods.videos(videosCount).call();
      this.setState({
        currentHash: latest.hash,
        currentTitle: latest.title,
      });
      this.setState({ loading: false });
    } else {
      window.alert("DVideo contract not deployed to detected network.");
    }
  }

  captureFile = (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file);

    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) });
      console.log("buffer", this.state.buffer);
    };
  };

  uploadVideo = (title) => {
    this.setState({ loading: true });
    console.log("Submitting file to IPFS...");

    //adding file to the IPFS
    ipfs.add(this.state.buffer, (error, result) => {
      console.log("IPFS result", result);
      if (error) {
        console.error(error);
        return;
      }

      this.state.videomarket.methods
        .uploadVideo(result[0].hash, title, 1)
        .send({ from: this.state.account })
        .on("transactionHash", (hash) => {
          this.setState({ loading: false });
        });
    });
  };

  
  buyToken = (amount) => {
    this.setState({ loading: true });
    this.state.videomarket.methods.buyToken().send({from: this.state.account, value: amount}).on('transactionHash', (hash) => {
    this.setState({ loading: false });
    })
  }

  sellToken = (amount) => {
    this.setState({ loading: true });
    this.state.videomarket.methods.sellToken(amount).send({from: this.state.account }).on('transactionHash', (hash) => {
    this.setState({ loading: false });
    })
  }

  withdraw = () => {
    this.setState({ loading: true });
    this.state.videomarket.methods.withdraw().send({from: this.state.account }).on('transactionHash', (hash) => {
    this.setState({ loading: false });
    })    
  }

  constructor(props) {
    super(props);
    this.state = {
      buffer: null,
      account: "",
      videomarket: null,
      videos: [],
      loading: true,
      currentHash: null,
      currentTitle: null,
      balance: 0
    };

    this.uploadVideo = this.uploadVideo.bind(this);
    this.captureFile = this.captureFile.bind(this);
    this.buyToken = this.buyToken.bind(this);
    this.sellToken = this.sellToken.bind(this);
    this.withdraw = this.withdraw.bind(this);
  }

  render() {
    const { classes } = this.props;
    return (
      <div
        style={{ width: "100%", height: "80%"}}
      >
        {this.state.loading ? (
          <div className="center mt-19">
            {/* loader */}
            <br></br>
            <FingerprintSpinner
              style={{ width: "100%" }}
              color="grey"
              size="100"
            />
          </div>
        ) : (
          <div style={{ marginLeft: "30%", marginRight: "30%" }}>
            <br></br>
            <Card className={classes.root}>
              <div className={classes.root}>
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    const title = this.videoTitle.value;
                    this.uploadVideo(title);
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <input
                      accept=".mp4, .mkv .ogg .wmv"
                      className={classes.input}
                      id="icon-button-file"
                      type="file"
                      onChange={this.captureFile}
                    />
                    <label htmlFor="icon-button-file">
                      <IconButton
                        color="primary"
                        aria-label="upload picture"
                        component="span"
                      >
                        <VideoCallIcon />
                      </IconButton>
                    </label>
                  </div>
                  <div>
                    <input
                      id="videoTitle"
                      type="text"
                      ref={(input) => {
                        this.videoTitle = input;
                      }}
                      className="form-control"
                      placeholder="Title ..."
                      required
                    />
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: "2%",
                      }}
                    >
                      <Button
                        type="submit"
                        color="secondary"
                        className={classes.button}
                        startIcon={<CloudUploadIcon />}
                      >
                        Upload
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            </Card>
          </div>
        )}
      </div>
    );
  }
}

export default withStyles(useStyles)(Video);
