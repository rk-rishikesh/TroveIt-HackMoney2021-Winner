import React, { Component } from "react";
import Web3 from "web3";
import TroveIt from "../../abis/TroveIt.json";
import { FingerprintSpinner } from "react-epic-spinners";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Favorite from "@material-ui/icons/Favorite";
import FavoriteBorder from "@material-ui/icons/FavoriteBorder";
import token from "../TroveIT UI Elements/trovetoken.png";
import { withStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import Button from "@material-ui/core/Button";
import AccountBalanceWalletIcon from "@material-ui/icons/AccountBalanceWallet";
import ImportExportIcon from "@material-ui/icons/ImportExport";
import SystemUpdateAltIcon from "@material-ui/icons/SystemUpdateAlt";
import SearchIcon from "@material-ui/icons/Search";
import LoyaltyIcon from "@material-ui/icons/Loyalty";
import NearMeIcon from '@material-ui/icons/NearMe';
import { Form } from "react-bootstrap";

const useStyles = (theme) => ({
  root: {
    "& > *": {
      margin: theme.spacing(0.5),
    },
  },
  input: {
    display: "none",
  },
});

class MyProfile extends Component {
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
    this.setState({ showPostaccount: accounts[0] });
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

      // Load original posts
      for (var i = 1; i <= originalPostCount; i++) {
        const originalPost = await troveit.methods.originalPosts(i).call();
        this.setState({
          originalPosts: [...this.state.originalPosts, originalPost],
        });
      }

      const feedPostCount = await troveit.methods.feedPostCount().call();

      this.setState({ feedPostCount });

      // Load feed posts
      for (var i = 1; i <= feedPostCount; i++) {
        const feedPost = await troveit.methods.feedPosts(i).call();
        this.setState({
          feedPosts: [...this.state.feedPosts, feedPost],
        });
      }

      const response = await troveit.methods
        .checkBalance()
        .call({ from: this.state.account });


      this.setState({ balance: response });
      console.log(response);
      console.log(this.state.balance)
      this.setState({ loading: false });
    } else {
      window.alert("Contract not deployed to detected network.");
    }
  }

  changeOwner(id, tipAmount) {
    this.setState({ loading: true });
    this.state.troveit.methods
      .changeOwner(id)
      .send({ from: this.state.account, value: tipAmount })
      .on("transactionHash", (hash) => {
        this.setState({ loading: false });
      });
  }

  buyToken = (amount) => {
    this.setState({ loading: true });
    this.state.troveit.methods
      .buyToken()
      .send({ from: this.state.account, value: amount })
      .on("transactionHash", (hash) => {
        this.setState({ loading: false });
      });
  };



  withdraw = () => {
    this.setState({ loading: true });
    console.log("Heloooo");
    this.state.troveit.methods
      .withdraw()
      .send({ from: this.state.account })
      .on("transactionHash", (hash) => {
        this.setState({ loading: false });
      });
  };

  likeOriginalPost(id) {
    this.setState({ loading: true });
    this.state.troveit.methods
      .likeOriginalPost(id)
      .send({ from: this.state.account })
      .on("transactionHash", (hash) => {
        this.setState({ loading: false });
      });
  }

  sellToken = (amount) => {
    this.setState({ loading: true });
    this.state.troveit.methods
      .sellToken(amount)
      .send({ from: this.state.account })
      .on("transactionHash", (hash) => {
        this.setState({ loading: false });
      });
  };

  donate = (receiver, amount) => {
    this.setState({ loading: true });
    //make payment
    this.state.troveit.methods
      .donate(receiver, amount)
      .send({ from: this.state.account })
      .on("transactionHash", (hash) => {
        this.setState({ loading: false });
      });
  };

  repost = (postId) => {
    this.setState({ loading: true });
    //make payment
    this.state.troveit.methods
      .repost(postId)
      .send({ from: this.state.account })
      .on("transactionHash", (hash) => {
        this.setState({ loading: false });
      });
  };

  constructor(props) {
    super(props);
    this.state = {
      account: "",
      showPostaccount: "",
      troveit: null,
      originalPostCount: 0,
      originalPosts: [],
      feedPostCount: 0,
      feedPosts: [],
      loading: true,
      balance: 0,
    };
    this.changeOwner = this.changeOwner.bind(this);
    this.buyToken = this.buyToken.bind(this);
    this.sellToken = this.sellToken.bind(this);
    this.withdraw = this.withdraw.bind(this);
    this.likeOriginalPost = this.likeOriginalPost.bind(this);
    this.donate = this.donate.bind(this);
    this.repost = this.repost.bind(this);
  }

  render() {
    const { classes } = this.props;
    return (
      <div style={{ width: "100%", height: "100%" }}>
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

                <Card className={classes.root} style={{ width: "100%" }}>
                  <div style={{ display: "flex" }}>
                    <div className={classes.root}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          marginTop: "2%",
                        }}
                      >
                        <img
                          src={token}
                          style={{ height: 80, width: 80 }}
                          alt="trove token"
                        />
                        <div>
                          <Button
                            type="submit"
                            color="secondary"
                            onClick={() => {
                              let amount = window.web3.utils.toWei(
                                "0.1",
                                "Ether"
                              );
                              this.buyToken(amount);
                              
                            }}
                          >
                            <AccountBalanceWalletIcon />
                            Buy Token
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* SELL */}
                    <div className={classes.root}>
                      <Form
                        onSubmit={(e) => {
                          e.preventDefault();
                          console.log(this.inputAmount.value, this.state.account);
                          this.sellToken(this.inputAmount.value);
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <img
                            src={token}
                            style={{ height: 80, width: 80, marginRight: "2%" }}
                            alt="trove token"
                          />
                          <div>
                            <input
                              ref={(amount) => {
                                this.inputAmount = amount;
                              }}
                              type="number"
                              style={{ width: "100%", marginLeft: "1%" }}
                              className="form-control"
                              placeholder="Token Amount"
                              required
                            />
                            <input type="submit" hidden={true} />
                          </div>

                          <div>
                            <Button type="submit" color="secondary">
                              <ImportExportIcon />
                              Sell Token
                            </Button>
                          </div>
                        </div>
                      </Form>
                    </div>

                    {/* WITHDRAW */}
                    <div className={classes.root}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          marginTop: "2%",
                        }}
                      >
                        <img
                          src={token}
                          style={{ height: 80, width: 80 }}
                          alt="trove token"
                        />
                        <div>
                          <Button
                            type="submit"
                            color="secondary"
                            onClick={() => {
                              this.withdraw();
                              console.log("Helo");
                            }}
                          >
                            <SystemUpdateAltIcon />
                            Withdraw
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* BALANCE */}
                    <div className={classes.root}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          marginTop: "2%",
                        }}
                      >
                        <img
                          src={token}
                          style={{ height: 80, width: 80 }}
                          alt="trove token"
                        />
                        <h6 style={{ color: "crimson" }}>
                          &nbsp;&nbsp;&nbsp;MY BALANCE: {this.state.balance} TT
                        </h6>
                      </div>
                    </div>
                  </div>
                </Card>
                <br></br>

                <div className="card mb-4">
                  <ul id="imageList" className="list-group list-group-flush">
                    <li className="list-group-item py-2">
                      <div className="float-left pt-0">
                        <Form
                          onSubmit={(e) => {
                            e.preventDefault();
                            this.setState({
                              showPostaccount: this.inputQueID.value,
                            });
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <div>
                              <input
                                ref={(inputID) => {
                                  this.inputQueID = inputID;
                                }}
                                type="text"
                                style={{ width: "100%" }}
                                className="form-control"
                                placeholder="Account address"
                                required
                              />
                              <input type="submit" hidden={true} />
                            </div>

                            <div>
                              <Button type="submit" color="primary">
                                <SearchIcon />
                                Search User
                              </Button>
                            </div>
                          </div>
                        </Form>
                      </div>

                      {/* DONATE */}
                      <div
                        className="float-right pt-0"
                        style={{
                          margin: "auto",
                          display: "block",
                          width: "fit-content",
                        }}
                      >
                        <div className="float-left pt-0">
                          <Form
                            onSubmit={(e) => {
                              e.preventDefault();
                              this.donate(
                                this.state.showPostaccount,
                                this.input.value
                              );
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <div>
                                <input
                                  ref={(amount) => {
                                    this.input = amount;
                                  }}
                                  type="number"
                                  style={{ width: "100%", marginLeft: "1%" }}
                                  className="form-control"
                                  placeholder="Token Amount"
                                  required
                                />
                                <input type="submit" hidden={true} />
                              </div>

                              <div>
                                <Button type="submit" color="primary">
                                  <LoyaltyIcon />
                                  Donate Token
                                </Button>
                              </div>
                            </div>
                          </Form>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
                <br></br>
                <br></br>
                {/* MY POSTS */}
                <div
                  class="col-lg-12 ml-auto mr-auto"
                  style={{ maxWidth: "780px" }}
                >
                  {this.state.originalPosts.map((originalPost, key) => {
                    if (originalPost.owner === this.state.showPostaccount) {
                      return (
                        <div className="card mb-4" key={key}>
                          <div className="card-header">
                            <small className="text-muted">
                              {originalPost.owner}
                            </small>
                            {originalPost.martketplace ? (
                              <div></div>
                            ) : (
                              <div
                                className="btn btn-link btn-sm float-right pt-0"
                                style={{
                                  margin: "auto",
                                  display: "block",
                                  width: "fit-content",
                                }}
                              >
                                <button
                                  className="btn btn-link btn-sm float-left pt-0"
                                  onClick={(event) => {
                                    this.repost(originalPost.id);
                                  }}
                                >
                                  <NearMeIcon />
                                </button>
                              </div>
                            )}
                          </div>

                          <ul
                            id="imageList"
                            className="list-group list-group-flush"
                          >
                            <li className="list-group-item">
                              <p class="text-center">
                                <img
                                  src={`https://ipfs.infura.io/ipfs/${originalPost.hash}`}
                                  style={{ maxWidth: "420px" }}
                                  alt="Post"
                                />
                              </p>
                              <p style={{color:"black"}}>{originalPost.caption}</p>
                            </li>
                            <li key={key} className="list-group-item py-2">
                              <button
                                className="btn btn-link btn-sm float-left pt-0"
                                name={originalPost.id}
                                onClick={(event) => {
                                  let tipAmount = 1000000000000000000;
                                  console.log(event.target.name, tipAmount);
                                  this.changeOwner(
                                    event.target.name,
                                    tipAmount
                                  );
                                }}
                              >
                                Buy
                              </button>
                              <div
                                className="btn btn-link btn-sm float-right pt-0"
                                style={{
                                  margin: "auto",
                                  display: "block",
                                  width: "fit-content",
                                }}
                              >
                                <button
                                  className="btn btn-link btn-sm float-left pt-0"
                                  name={originalPost.id}
                                  onClick={(event) => {
                                    this.likeOriginalPost(event.target.name);
                                  }}
                                >
                                  {originalPost.likes} <Favorite />
                                </button>
                              </div>
                            </li>
                          </ul>
                        </div>
                      );
                    }
                  })}
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

export default withStyles(useStyles)(MyProfile);
