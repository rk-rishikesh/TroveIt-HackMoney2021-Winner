import React, { Component } from 'react';
import Web3 from 'web3';
import { Biconomy } from '@biconomy/mexa';
import TroveIt from '../../abis/TroveIt.json'
import {FingerprintSpinner} from 'react-epic-spinners'
import Favorite from '@material-ui/icons/Favorite';


//import Portis from '@portis/web3';
const style = {
  content: {
    height: "100%",
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    color: "white",
    padding: 7,
    borderRadius: 20,
  }
}

let biconomy;

class Feeds extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      biconomy = new Biconomy(window.ethereum, { apiKey: "GmWNyq8kr.8729384c-dac2-4156-aca6-ac4208761300" });
      window.web3 = new Web3(biconomy)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      biconomy = new Biconomy(window.web3.currentProvider, { apiKey: "GmWNyq8kr.8729384c-dac2-4156-aca6-ac4208761300" });
      window.web3 = new Web3(biconomy)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {

    const web3 = window.web3
    
    biconomy.onEvent(biconomy.READY, async() => {
    // Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    // Network ID
    const networkId = await web3.eth.net.getId()
    const networkData = TroveIt.networks[networkId]
    if(networkData) {
      const troveIt = new web3.eth.Contract(TroveIt.abi, networkData.address)
      this.setState({ troveIt })
      
      const feedPostCount = await troveIt.methods.feedPostCount().call()

      this.setState({ feedPostCount })

      // Load feed posts
      for (var i = 1; i <= feedPostCount; i++) {
        const feedPost = await troveIt.methods.feedPosts(i).call()
        this.setState({
          feedPosts: [...this.state.feedPosts, feedPost]
        })
      }

      this.setState({ loading: false})

    } else {
      window.alert('TroveIt contract not deployed to detected network.')
    }

  }).onEvent(biconomy.ERROR, (error, message) => {
      
    // Handle error while initializing mexa
    console.log(error)
  });

  }

  likeFeedPost(feedId, originalPostId){
    this.setState({ loading: true })
    this.state.troveIt.methods.likeFeedPost(feedId, originalPostId).send({ from: this.state.account }).on('transactionHash', (hash) => {
    this.setState({ loading: false })
  })
  }


  constructor(props) {
    super(props)
    this.state = {
      account: '',
      troveIt: null,
      feedPostCount: 0,
      feedPosts: [],
      loading: true,
    }

    this.likeFeedPost = this.likeFeedPost.bind(this)
  }

  render() {
    return (
      <div style={{width:"100%", height: "100%", backgroundRepeat:"inherit"}} >
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
            <div class="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '780px' }}>
              { this.state.feedPosts.map((feedPost, key) => {
                return(
                  <div className="card mb-4" key={key} >
                    <div className="card-header">
                      <small className="text-muted">{feedPost.owner}</small>
                    </div>
                    <ul id="imageList" className="list-group list-group-flush">
                      <li className="list-group-item">
                        <p class="text-center"><img src={`https://ipfs.infura.io/ipfs/${feedPost.hash}`} style={{ maxWidth: '420px'}}/></p>
                        <p style={{color:"black"}}>{feedPost.caption}</p>
                      </li>
                      <li key={key} className="list-group-item py-2">
                        <p className="float-left" style={{color:"black"}}>
                          Original Post ID: {feedPost.originalId}
                        </p> 
                      <div className="btn btn-link btn-sm float-right pt-0" style={{
                            margin: 'auto',
                            display: 'block',
                            width: 'fit-content'
                            }}>

                            <button
                              className="btn btn-link btn-sm float-left pt-0"
                              onClick={(event) => {                            
                                this.likeFeedPost(feedPost.id, feedPost.originalId)
                                
                              }}
                            >
                            {feedPost.likes}  <Favorite/>
                            </button>
                            
                        </div>
                      </li>
                    </ul>
                  </div>
                )
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

export default Feeds;