import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import Button from "@material-ui/core/Button";
import Web3 from "web3";
import TroveIt from "../../abis/TroveIt.json";
import { FingerprintSpinner } from "react-epic-spinners";
import AddAPhotoIcon from '@material-ui/icons/AddAPhoto';
import IconButton from "@material-ui/core/IconButton";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import JIMP from "jimp";


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



class Upload extends Component {
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
    
    // Initialize your dapp here like getting user accounts etc
    // Load account
    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });
    // Network ID
    const networkId = await web3.eth.net.getId();
    const networkData = TroveIt.networks[networkId];
    if (networkData) {
      const troveit = new web3.eth.Contract(TroveIt.abi, networkData.address);
      this.setState({ troveit });

      const originalPostCount = await troveit.methods
        .originalPostCount()
        .call();

      this.setState({ originalPostCount });

      // Load original troveit
      for (var i = 1; i <= originalPostCount; i++) {
        const originalPost = await troveit.methods.originalPosts(i).call();
        this.setState({
          originalPosts: [...this.state.originalPosts, originalPost],
        });
      }

      const feedPostCount = await troveit.methods.feedPostCount().call();

      this.setState({ feedPostCount });

      this.setState({ loading: false });
    } else {
      window.alert("TroveIt contract not deployed to detected network.");
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

  uploadPost = (caption, rate) => {
    this.setState({ loading: true });
    console.log("Submitting file to IPFS...");
    //adding file to the IPFS
    ipfs.add(this.state.buffer, (error, result) => {
      console.log("Ipfs result", result);
      if (error) {
        console.error(error);
        return;
      }

      async function getHash(img1) {
        const loadImage1 = await JIMP.read(img1);
        const hash1 = loadImage1.hash();
        return hash1;
      }

      const babe = getHash(`https://ipfs.infura.io/ipfs/${result[0].hash}`);
      console.log(babe);

      //Feed Post
      this.state.originalPosts.forEach((originalPost) => {
        babe.then((value) => {
          console.log("Feed : ", JIMP.compareHashes(value, originalPost.phash));
          if (
            result[0].hash == originalPost.hash ||
            JIMP.compareHashes(value, originalPost.phash) <= 0.50
          ) {
            //add condition here
            this.setState({ flag: false });
            console.log("FEED POST");
            console.log("Original Owner : ", originalPost.owner);
            this.state.troveit.methods
              .uploadPost(result[0].hash, value, caption, false, rate, originalPost.id, originalPost.owner)
              .send({ from: this.state.account })
              .on("transactionHash", (hash) => {
                this.setState({ loading: false });
              });
          }
          console.log(value);
        });
      });

      //Original Post
      babe.then((value) => {
        if (this.state.flag) {
          console.log("Ori : ", value);
          this.setState({ loading: true });
          console.log(value);
          console.log("ORIGINAL");
          this.state.troveit.methods
            .uploadPost(result[0].hash, value, caption, true, rate, 1, this.state.account)
            .send({ from: this.state.account })
            .on("transactionHash", (hash) => {
              this.setState({ loading: false });
            });
        }
      });
    });
  };

  constructor(props) {
    super(props);
    this.state = {
      account: "",
      troveit: null,
      originalPostCount: 0,
      originalPosts: [],
      feedPostCount: 0,
      loading: true,
      flag: true,
    };

    this.uploadPost = this.uploadPost.bind(this);
    this.captureFile = this.captureFile.bind(this);
  }

  render() {
    const { classes } = this.props;
    return (
      <div
        style={{ width: "100%", height: "80%" }}
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
                    const caption = this.imageCaption.value;
                    const rate = this.imagePrice.value;
                    this.uploadPost(caption, rate);
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
                      accept="image/*"
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
                        <AddAPhotoIcon />
                      </IconButton>
                    </label>
                  </div>
                  {/* Add caption */}
                  <div>
                    <input
                      id="imageCaption"
                      type="text"
                      ref={(input) => {
                        this.imageCaption = input;
                      }}
                      className="form-control"
                      placeholder="Caption ..."
                      required
                    />
                    <br></br>
                    <input
                      id="imagePrice"
                      type="number"
                      ref={(inputPrice) => {
                        this.imagePrice = inputPrice;
                      }}
                      className="form-control"
                      placeholder="Set Price"
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

export default withStyles(useStyles)(Upload);
