const Trove = artifacts.require("Trove");
const TroveCoin = artifacts.require("TroveCoin");
const DVideo = artifacts.require("DVideo");


module.exports = function(deployer) {
  deployer.deploy(Trove);

  deployer.deploy(TroveCoin);

  deployer.deploy(DVideo);
};
