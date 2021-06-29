import React, { Component } from 'react';
import Web3 from 'web3';
import Posts from '../../abis/Posts.json'
import {FingerprintSpinner} from 'react-epic-spinners'
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Favorite from '@material-ui/icons/Favorite';
import FavoriteBorder from '@material-ui/icons/FavoriteBorder';


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

class MarketPlace extends Component {

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
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    // Network ID
    const networkId = await web3.eth.net.getId()
    const networkData = Posts.networks[networkId]
    if(networkData) {
      const posts = new web3.eth.Contract(Posts.abi, networkData.address)
      this.setState({ posts })
      
      const originalPostCount = await posts.methods.originalPostCount().call()
      this.setState({ originalPostCount })

      // Load original posts
      for (var i = 1; i <= originalPostCount; i++) {
        const originalPost = await posts.methods.originalPosts(i).call()
        this.setState({
            originalPosts: [...this.state.originalPosts, originalPost]
        })
      }

      this.setState({ loading: false})

    } else {
      window.alert('Posts contract not deployed to detected network.')
    }
  }

  changeOwner(id, tipAmount) {
      this.setState({ loading: true })
      this.state.posts.methods.changeOwner(id).send({ from: this.state.account, value: tipAmount }).on('transactionHash', (hash) => {
      this.setState({ loading: false })
  })
    
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      posts: null,
      originalPostCount: 0,
      originalPosts: [],
      loading: true,
    }
    this.changeOwner = this.changeOwner.bind(this)
  }

  render() {
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
            <div class="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '780px' }}>
              { this.state.originalPosts.map((originalPost, key) => {
                return(
                  <div className="card mb-4" key={key} >
                    <div className="card-header">
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

export default MarketPlace;