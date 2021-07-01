import React, { Component } from "react";
import Web3 from "web3";
import TroveIt from "../../abis/TroveIt.json";
import { FingerprintSpinner } from "react-epic-spinners";
import ScrollMenu from "react-horizontal-scrolling-menu";
import "./videoBar.css";

const style = {
  content: {
    height: "100%",
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    color: "white",
    padding: 7,
    borderRadius: 20,
  },
};

//Declare IPFS
const ipfsClient = require("ipfs-http-client");
const ipfs = ipfsClient({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
}); // leaving out the arguments will default to these values

class VideoChoice extends Component {
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
    const networkData = TroveIt.networks[networkId];
    if (networkData) {
      const troveit = new web3.eth.Contract(TroveIt.abi, networkData.address);
      this.setState({ troveit });
      const videosCount = await troveit.methods.videoCount().call();
      this.setState({ videosCount });

      // Load videos, sort by newest
      for (var i = videosCount; i >= 1; i--) {
        const video = await troveit.methods.videos(i).call();
        this.setState({
          videos: [...this.state.videos, video],
        });
      }

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
    console.log("Submitting file to IPFS...");

    //adding file to the IPFS
    ipfs.add(this.state.buffer, (error, result) => {
      console.log("IPFS result", result);
      if (error) {
        console.error(error);
        return;
      }

      this.setState({ loading: true });
      this.state.troveit.methods
        .uploadVideo(result[0].hash, title, 1)
        .send({ from: this.state.account })
        .on("transactionHash", (hash) => {
          this.setState({ loading: false });
        });
    });
  };

  changeVideo = (id, hash, title, owner) => {
    this.setState({ loading: true });
    //make payment
    this.state.troveit.methods.watchVideo(id).send({ from: this.state.account}).on('transactionHash', (hash) => {
      this.setState({ loading: false })
    })

    this.setState({ currentHash: hash });
    this.setState({ currentTitle: title });
    this.setState({ currentOwner: owner });
  };


  constructor(props) {
    super(props);
    this.state = {
      buffer: null,
      account: "",
      troveit: null,
      videos: [],
      loading: true,
      currentHash: null,
      currentTitle: null,
      currentOwner: null,
    };

    this.uploadVideo = this.uploadVideo.bind(this);
    this.captureFile = this.captureFile.bind(this);
    this.changeVideo = this.changeVideo.bind(this);
  }

  render() {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
        }}
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
          <div>
            <div className="about">
              <div class="container">
                <br></br>
                <div className="videoBar">
                  <ScrollMenu
                    arrowLeft={
                      <div style={{ fontSize: "60px", color: "black" }}>
                        {" < "}
                      </div>
                    }
                    arrowRight={
                      <div style={{ fontSize: "60px", color: "black" }}>
                        {" > "}
                      </div>
                    }
                    data={this.state.videos.map((video, key) => {
                      return (
                        <div
                          className="card mb-4 text-center"
                          style={{ width: "500px", height: "250px" }}
                          key={key}
                        >
                          <div className="card-title bg-dark">
                            <small className="text-black">
                              <b>{video.title}</b>
                            </small>
                          </div>
                          <div>
                            <p
                              onClick={() => {
                                this.changeVideo(
                                  video.id,
                                  video.hash,
                                  video.title,
                                  video.author,                                  
                                )
                              }
                                
                              }
                            >
                              <video
                                src={`https://ipfs.infura.io/ipfs/${video.hash}`}
                                style={{ width: "300px" }}
                              />
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  />
                </div>
                <div className="about">
                  <div class="container">
                    <br></br>
                    <div
                      class="col-lg-12 ml-auto mr-auto"
                      style={{ maxWidth: "780px" }}
                    >
                      <div className="card-header" style={{backgroundColor:"white"}}>
                        <small className="text-muted">
                          {this.state.currentOwner}
                        </small>
                      </div>
                      <div className="card mb-4">
                        <div
                          className="embed-responsive embed-responsive-16by9"
                          style={{ maxHeight: "768px" }}
                        >
                          <video
                            src={`https://ipfs.infura.io/ipfs/${this.state.currentHash}`}
                            controls
                          ></video>
                        </div>
                        <h3>
                          <b>
                            <i style={{ color: "black", marginLeft: "2%" }}>
                              {this.state.currentTitle}
                            </i>
                          </b>
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <br></br>
      </div>
    );
  }
}

export default VideoChoice;
