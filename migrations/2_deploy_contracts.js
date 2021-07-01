//const TroveCoin = artifacts.require("TroveCoin");
const TroveIt = artifacts.require("TroveIt");
//const Posts = artifacts.require("Posts");
//const VideoMarket = artifacts.require("VideoMarket");

module.exports = function(deployer) {
  //deployer.deploy(TroveCoin);

  deployer.deploy(TroveIt);
  
  //deployer.deploy(Posts);
  //deployer.deploy(VideoMarket);
  
};
