import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Navbar from './NavBar/Navbar';
import MyProfile from './MyProfile/MyProfile';
import Posts from '../abis/Posts.json'
import Web3 from 'web3';
import MarketPlace from './MarketPlace/MarketPlace';
import Upload from './Upload/Upload';
import Feeds from './Feeds/Feeds';
import Video from './Video/Video';
import VideoChoice from './Video/VideoChoice';

class App extends Component {
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

      this.setState({ loading: false})

    } else {
      window.alert('Posts contract not deployed to detected network.')
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      posts: null
    }
  }

  render() {
    return (
      <div className="App" style={{backgroundSize: "cover",
      height: "100vh",
      color: "#f5f5f5"}}>
        {/* App NavBar */}
        <Router>
          <Navbar account={this.state.account}/>
          <Switch>           
            <Route path="/" exact component={() => <Upload/>} />
            <Route path="/feeds" exact component={() => <Feeds />} />
            <Route path="/marketplace" exact component={() => <MarketPlace />} />
            <Route path="/myprofile" exact component={() => <MyProfile />} />
            <Route path="/uploadVideo" exact component={() => <Video/> } />
            <Route path="/selectVideo" exact component={() => <VideoChoice/> } />
          </Switch>          
        </Router>
      </div>
    );
  }
  
}

export default App;