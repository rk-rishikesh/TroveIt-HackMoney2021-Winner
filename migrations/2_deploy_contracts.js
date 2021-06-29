// const Posts = artifacts.require("Posts");
// const TroveCoin = artifacts.require("TroveCoin");
const VideoMarket = artifacts.require("VideoMarket");

module.exports = function(deployer) {

  // deployer.deploy(Posts);
  // deployer.deploy(TroveCoin);
  deployer.deploy(VideoMarket);
  
};
