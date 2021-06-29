import React, { Component } from 'react';
import Web3 from 'web3';
import Posts from '../../abis/Posts.json'
import {FingerprintSpinner} from 'react-epic-spinners'
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Favorite from '@material-ui/icons/Favorite';
import FavoriteBorder from '@material-ui/icons/FavoriteBorder';
import token from '../TroveIT UI Elements/trovetoken.png';
import { withStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import Button from "@material-ui/core/Button";
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import ImportExportIcon from '@material-ui/icons/ImportExport';
import SystemUpdateAltIcon from '@material-ui/icons/SystemUpdateAlt';
import VideoMarket from "../../abis/VideoMarket.json";

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
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    //const portis = new Portis('4f6dfbbd-21cb-4b4f-a497-1103fdedafd0', 'maticTestnet');
    //const web3 = new Web3(portis.provider);
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    // Network ID
    const networkId = await web3.eth.net.getId()
    const networkData = Posts.networks[networkId]
    const networkTwoData = VideoMarket.networks[networkId];

    if(networkData && networkTwoData) {
      
      const vidhira = new web3.eth.Contract(Posts.abi, networkData.address)
      this.setState({ vidhira })

      const dvideo = new web3.eth.Contract(VideoMarket.abi, networkTwoData.address);
      this.setState({ dvideo });
      
      const originalPostCount = await vidhira.methods.originalPostCount().call()
      this.setState({ originalPostCount })

      // Load original posts
      for (var i = 1; i <= originalPostCount; i++) {
        const originalPost = await vidhira.methods.originalPosts(i).call()
        this.setState({
            originalPosts: [...this.state.originalPosts, originalPost]
        })
      }
      
      const feedPostCount = await vidhira.methods.feedPostCount().call()

      this.setState({ feedPostCount })
      
      // Load feed posts
      for (var i = 1; i <= feedPostCount; i++) {
        const feedPost = await vidhira.methods.feedPosts(i).call()
        this.setState({
          feedPosts: [...this.state.feedPosts, feedPost]
        })
      }

      const response = await dvideo.methods.checkBalance().call({from: this.state.account })
      console.log(response);
      this.setState({balance: response})
      
      this.setState({ loading: false})

    } else {
      window.alert('Contract not deployed to detected network.')
    }
  }

  changeOwner(id, tipAmount) {
      this.setState({ loading: true })
      this.state.vidhira.methods.changeOwner(id).send({ from: this.state.account, value: tipAmount }).on('transactionHash', (hash) => {
      this.setState({ loading: false })
  })
    
  }

  buyToken = (amount) => {
    this.setState({ loading: true });
    this.state.dvideo.methods.buyToken().send({from: this.state.account, value: amount}).on('transactionHash', (hash) => {
    this.setState({ loading: false });
    })
  }

  sellToken = (amount) => {
    this.setState({ loading: true });
    this.state.dvideo.methods.sellToken(amount).send({from: this.state.account }).on('transactionHash', (hash) => {
    this.setState({ loading: false });
    })
  }

  withdraw = () => {
    this.setState({ loading: true });
    this.state.dvideo.methods.withdraw().send({from: this.state.account }).on('transactionHash', (hash) => {
    this.setState({ loading: false });
    })    
  }


  constructor(props) {
    super(props)
    this.state = {
      account: '',
      vidhira: null,
      dvideo: null,
      originalPostCount: 0,
      originalPosts: [],
      feedPostCount: 0,
      feedPosts: [],
      loading: true,
      balance: 0
    }
    this.changeOwner = this.changeOwner.bind(this)
    this.buyToken = this.buyToken.bind(this);
    this.sellToken = this.sellToken.bind(this);
    this.withdraw = this.withdraw.bind(this);
  }

  render() {
    const { classes } = this.props;
    return (
      <div style={{width:"100%", height: "100%"}}>
        { this.state.loading
          ? 
          <div className="center mt-19">
            {/* loader */}
              <br></br>
              <FingerprintSpinner
                style={{width: "100%"}}
                color='grey'
                size='100'
	            />
            </div>
          : 
          <div>
          <div className="about">
          <div class="container">
            <br></br>
            
          <Card className={classes.root} style={{width:"100%"}}>
            <div style={{display: "flex"}}>

              <div className={classes.root}>
              <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: "2%",
                  }}
                >
                  <img src={token} style={{height: 80, width: 80}} alt="trove token" />
                  <div >
                  <Button
                    type="submit"
                    color="secondary"
                    onClick={() => { 
                      let amount = window.web3.utils.toWei('0.1', 'Ether')
                      this.buyToken(amount)
                    }}
                  >
                    <AccountBalanceWalletIcon/>
                    Buy Token
                  </Button>
                  </div>
                  </div>
              </div>
              
            {/* SELL */}
            <div className={classes.root}>
              <div
                  style={{
                    display: "flex",
                    alignItems: "center",                   
                  }}
                >
                  <img src={token} style={{height: 80, width: 80, marginRight: "2%"}} alt="trove token" />
                  <div style={{width:"30%"}}>
                    <input
                          id="imageCaption"
                          type="number"
                          width="2%" 
                          ref={(tokenAmount) => {
                            this.inputTokenAmount = tokenAmount
                          }}
                          className="form-control"
                          required
                        />
                    </div>
                    <div>
                
                    <Button
                      type="submit"
                      color="secondary"
                      onClick={() => { 
                        let amount = window.web3.utils.toWei('0.1', 'Ether')
                        this.buyToken(amount)
                      }}
                    >
                      <ImportExportIcon/>
                      Sell Token
                    </Button>
                  </div>
                  </div>
              </div>

              {/* <div className={classes.root} >
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    this.sellToken(this.inputTokenAmount.value)
                  }}
                >
                  
                  
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: "2%",
                      }}
                    >
                      <img src={token} style={{height: 80, width: 80}} alt="trove token" />
                      <input
                      id="imageCaption"
                      type="number" 
                      style={{ width: "15%", marginLeft:"1%", marginRight:"1%"}}
                      ref={(tokenAmount) => {
                        this.inputTokenAmount = tokenAmount
                      }}
                      className="form-control"
                      required
                    />
                      <Button
                        type="submit"
                        color="secondary"
                      >
                        <ImportExportIcon/>
                        Sell Tokens
                      </Button>
                      
                    </div>
                  
                </form>
              </div> */}
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
                      <img src={token} style={{height: 80, width: 80}} alt="trove token" />
                      <div >
                      <Button
                        type="submit"
                        color="secondary"
                        onClick={() => { 
                          this.withdraw()
                        }}
                      >
                        <SystemUpdateAltIcon/>
                        Withdraw
                      </Button>
                      </div>
                  </div>
              </div>

              {/* BALANCE */}
                <div className={classes.root} >
                  <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          marginTop: "2%"
                        }}
                      >
                    <img src={token} style={{height: 80, width: 80}} alt="trove token" />
                 <h6 style={{color:"crimson"}}>&nbsp;&nbsp;&nbsp;MY BALANCE: {this.state.balance} TT</h6>
                  </div>
                </div>
              </div>
              
            </Card>
            <br></br>
            {/* MY POSTS */}
            <div class="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '780px' }}>
              { this.state.originalPosts.map((originalPost, key) => {
                  if (originalPost.owner == this.state.account) {
                return(

                    
                  <div className="card mb-4" key={key} >
                    <div className="card-header">
                      {/* <img
                        className='mr-2'
                        width='30'
                        height='30'
                        src={`data:image/png;base64,${new Identicon(image.author, 30).toString()}`}
                      /> */}
                      <small className="text-muted">{originalPost.owner}</small>
                    </div>
                    <ul id="imageList" className="list-group list-group-flush">
                      <li className="list-group-item">
                        <p class="text-center"><img src={`https://ipfs.infura.io/ipfs/${originalPost.hash}`} style={{ maxWidth: '420px'}}/></p>
                        <p>{originalPost.caption}</p>
                      </li>
                      <li key={key} className="list-group-item py-2">
                      <button
                          className="btn btn-link btn-sm float-left pt-0"
                          name={originalPost.id}
                          onClick={(event) => {
                            let tipAmount = 1000000000000000000
                            console.log(event.target.name, tipAmount)
                            this.changeOwner(event.target.name, tipAmount)
                          }}
                        >
                          Buy
                        </button>
                        <div className="btn btn-link btn-sm float-right pt-0" style={{
                            margin: 'auto',
                            display: 'block',
                            width: 'fit-content'
                            }}>
                            <FormControlLabel
                                control={<Checkbox icon={<FavoriteBorder />} checkedIcon={<Favorite />}
                                name="checked" />}
                            />
                        </div>
                      </li>
                    </ul>
                  </div>
                )}
              })}
              </div>
          </div>
        </div>
        </div>
        }
        <br></br>
      </div>
    );
  }
}

export default withStyles(useStyles)(MyProfile);