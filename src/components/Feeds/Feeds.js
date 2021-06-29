import React, { Component } from 'react';
import Web3 from 'web3';
import Posts from '../../abis/Posts.json'
import {FingerprintSpinner} from 'react-epic-spinners'
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Favorite from '@material-ui/icons/Favorite';
import FavoriteBorder from '@material-ui/icons/FavoriteBorder';


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

class Feeds extends Component {

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
      
      const feedPostCount = await posts.methods.feedPostCount().call()

      this.setState({ feedPostCount })

      // Load feed posts
      for (var i = 1; i <= feedPostCount; i++) {
        const feedPost = await posts.methods.feedPosts(i).call()
        this.setState({
          feedPosts: [...this.state.feedPosts, feedPost]
        })
      }

      this.setState({ loading: false})

    } else {
      window.alert('Posts contract not deployed to detected network.')
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      posts: null,
      feedPostCount: 0,
      feedPosts: [],
      loading: true,
    }
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

export default Feeds;