// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.6.0;

import "./TroveCoin.sol";

contract TroveIt is TroveCoin{
    
    
    /**********************************************************************
                        Trove Token : Data Variables
    **********************************************************************/
    
    address public tokenAddress;
    
    constructor() public {
        tokenAddress = msg.sender;
    }
    
    uint256 private _sellPrice = 10**17; // 0.1 ether per token
    
    mapping (address => uint) private _pendingWithdrawals;
    
    /**********************************************************************
                        SignUp : Data Variables
    **********************************************************************/    
    
    uint256 public userCount = 0;
    mapping(uint => address) private _users;
    
    /**********************************************************************
                        MarketPlace : Data Variables
    **********************************************************************/
    
    uint256 public originalPostCount = 0;
    
    mapping(uint256 => OriginalPost) public originalPosts;
    
    struct OriginalPost {
        uint256 id;
        uint256 likes;
        string hash;
        string phash;
        string caption;
        address payable owner;
        bool martketplace;
        uint256 price;
    }
    
    /**********************************************************************
                        Feed : Data Variables
    **********************************************************************/
    
    uint256 public feedPostCount = 0;
    
    mapping(uint256 => FeedPost) public feedPosts;
    
    struct FeedPost {
        uint256 id;
        uint256 likes;
        string hash;
        string phash;
        string caption;
        uint256 originalId;
        address payable originalOwner;
        address payable owner;
    }
    
    /**********************************************************************
                        D-Reels : Data Variables
    **********************************************************************/   
    
    uint public videoCount = 0;
    
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
    
    /**********************************************************************
                        Trove Token : Functions
    **********************************************************************/
    
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
    
    /**********************************************************************
                        SignUp : Functions
    **********************************************************************/
    
    //1. SignUp
    function signUp() public {
        userCount++;
        _users[userCount] = msg.sender;
    }
    
    /**********************************************************************
                        MarketPlace & Feeds: Functions
    **********************************************************************/
    
    //1. Upload Post 
    function uploadPost(string memory _postHash, string memory _phash, string memory _caption, bool _original, uint256 _price, uint256 _originalId, address payable _originalOwner) public {
        // Make sure the post hash exists
        require(bytes(_postHash).length > 0);
        // Make sure post caption exists
        require(bytes(_caption).length > 0);
        // Make sure uploader address exists
        require(msg.sender!=address(0));
    
        if(_original){
            // Increment originalPost id
            originalPostCount ++;
        
            // Add Post to the contract
            originalPosts[originalPostCount] = OriginalPost(originalPostCount, 0, _postHash, _phash,_caption, msg.sender, true, _price);            
        }else{
            // Increment originalPost id
            feedPostCount ++;
        
            // Add Post to the contract
            feedPosts[feedPostCount] = FeedPost(feedPostCount, 0, _postHash, _phash,_caption, _originalId, _originalOwner, msg.sender);            
        }

    }
    
    //2. Like Original Post
    function likeOriginalPost(uint256 _postId) public {
        // Make sure the id is valid
        require(_postId > 0 && _postId <= originalPostCount);
        
        // Fetch the Post
        OriginalPost memory _post = originalPosts[_postId];
        // Increment Like
        _post.likes = _post.likes + 1;
        
        // Update the Post
        originalPosts[_postId] = _post;
    }

    //3. Like Feed Post
    function likeFeedPost(uint256 _feedpostId, uint256 _originalpostId) public {
        // Make sure the post id are valid
        require(_feedpostId > 0 && _feedpostId <= feedPostCount && _originalpostId > 0 && _originalpostId <= originalPostCount);
        
        // Fetch the Original Post
        OriginalPost memory _originalpost = originalPosts[_originalpostId];
        
        // Increment Like
        _originalpost.likes = _originalpost.likes + 1;
        
        // Update the Original Post
        originalPosts[_originalpostId] = _originalpost;
        
        // Fetch the Feed Post
        FeedPost memory _feedpost = feedPosts[_feedpostId];
        
        // Increment Like
        _feedpost.likes = _feedpost.likes + 1;
        
        // Update the Original Post
        feedPosts[_feedpostId] = _feedpost;        
        
    }
    
    //4. Buy a Post - Change the owner and transfer tokens  
    function changeOwner(uint256 _postId) public payable{
    
        // Make sure the id is valid
        require(_postId > 0 && _postId <= originalPostCount);
      
        // Fetch the Post
        OriginalPost memory _post = originalPosts[_postId];
        address payable _owner = _post.owner;
        //Fetch the price
        uint256 price = _post.price;
        
        // Pay the author by sending them trove token
        transfer(_owner, price);
        
        // Change Owner
        _post.owner = msg.sender;
        
        //Remove from martketplace
        _post.martketplace = false;
        
        // Update the Post
        originalPosts[_postId] = _post;
    
    }  

    //5. Repost on Marketplace
    function repost(uint256 _postId) public {
        // Make sure the id is valid
        require(_postId > 0 && _postId <= originalPostCount);
        
        // Fetch the Post
        OriginalPost memory _post = originalPosts[_postId];
        
        // Add to martketplace
        _post.martketplace = true;
        
        // Update the Post
        originalPosts[_postId] = _post;
    }
    
    /**********************************************************************
                        D-Reels : Functions
    **********************************************************************/   
    
    //1. Upload your video
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
  
    //2. Pay with Trove Tokens to watch Video
    function watchVideo(uint256 _id) public {
      //Fetch the video
      Video memory _video = videos[_id];
      address payable _author = _video.author;
      uint256 price = _video.price;
        
      // transfer tokens from callers to mentioned account
      transfer(_author, price);
    }
    
    /**********************************************************************
                       Donate : Functions
    **********************************************************************/
    function donate(address _receiver, uint256 _amount) public {
      // transfer tokens from callers to mentioned account
      transfer(_receiver, _amount);
    }
    
}