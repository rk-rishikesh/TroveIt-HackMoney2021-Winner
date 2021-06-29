// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.6.0;

import "./TroveCoin.sol";

contract VideoMarket is TroveCoin{
    
    address public tokenAddress;
    uint public videoCount = 0;
        
    constructor() public {
        tokenAddress = msg.sender;
    }
    
    uint256 private _sellPrice = 10**17; // 0.1 ether per token
    mapping (address => uint) private _pendingWithdrawals;
    
    mapping(uint => Video) public videos;

    struct Video {
        uint id;
        string hash;
        string title;
        address payable author;
        uint256 price; 
    }

      event VideoUploaded(
        uint id,
        string hash,
        string title,
        address payable author
      );
      
    // 1. Buy token
    function buyToken() public payable{
        uint256 amount = msg.value/_sellPrice;
        require(balanceOf(tokenAddress) >= amount, "Contract does not have enough tokens.");
        balances[msg.sender] = balances[msg.sender] + amount;
        balances[tokenAddress] = balances[tokenAddress] - amount;
        emit Transfer(tokenAddress, msg.sender, amount);
    }
    
    // 2. Sell token
    function sellToken(uint256 amount) public {
        require(balanceOf(msg.sender) >= amount, "Seller does not have enough tokens.");
        balances[msg.sender] = balances[msg.sender] - amount;
        balances[tokenAddress] = balances[tokenAddress] + amount;
        uint256 tokenPrice = amount * _sellPrice;
        _pendingWithdrawals[msg.sender] += tokenPrice;
        emit Transfer(msg.sender, tokenAddress, tokenPrice);

    }
    
    // 3. Check Balance
    function checkBalance() public view returns(uint256){
        return balanceOf(msg.sender);
    }
    
    // 4. Withdraw ethers
    function withdraw() public {
        uint amount = _pendingWithdrawals[msg.sender];
        msg.sender.transfer(amount);
        _pendingWithdrawals[msg.sender] = 0;
    }
    
    //5. Upload your video
    function uploadVideo(string memory _videoHash, string memory _title, uint256 _price) public {
    // Make sure the video hash exists
    require(bytes(_videoHash).length > 0);
    // Make sure video title exists
    require(bytes(_title).length > 0);
    // Make sure uploader address exists
    require(msg.sender!=address(0));

    // Increment video id
    videoCount ++;

    // Add video to the contract
    videos[videoCount] = Video(videoCount, _videoHash, _title, msg.sender, _price);
    // Trigger an event
    emit VideoUploaded(videoCount, _videoHash, _title, msg.sender);
  }
  
    //6. Purchase Video
    function watchVideo(uint256 _id) public {
      //Fetch the video
      Video memory _video = videos[_id];
      address payable _author = _video.author;
      uint256 price = _video.price;
        
      // transfer tokens from callers to mentioned account
      transfer(_author, price);
    }
    
}