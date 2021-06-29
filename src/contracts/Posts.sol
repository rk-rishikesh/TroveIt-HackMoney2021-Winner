// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.6.0;

contract Posts{
  
    uint256 public originalPostCount = 0;
    
    mapping(uint => OriginalPost) public originalPosts;
    
    struct OriginalPost {
        uint id;
        string hash;
        string phash;
        string caption;
        address payable owner;
        bool martketplace;
    }
    
    uint256 public feedPostCount = 0;
    
    mapping(uint => FeedPost) public feedPosts;
    
    struct FeedPost {
        uint id;
        string hash;
        string phash;
        string caption;
        address payable owner;
    }
    
      function uploadPost(string memory _postHash, string memory _phash, string memory _caption, bool _original) public {
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
            originalPosts[originalPostCount] = OriginalPost(originalPostCount, _postHash, _phash,_caption, msg.sender, true);            
        }else{
            // Increment originalPost id
            feedPostCount ++;
        
            // Add Post to the contract
            feedPosts[feedPostCount] = FeedPost(feedPostCount, _postHash, _phash,_caption, msg.sender);            
        }

      }
      
      function changeOwner(uint256 _postId) public payable {
        
        // Make sure the id is valid
        require(_postId > 0 && _postId <= originalPostCount);
        
        // Fetch the Post
        OriginalPost memory _post = originalPosts[_postId];
        
        //Fetch the author
        address payable _owner = _post.owner;
        
        // Pay the author by sending them Ether
        (_owner).transfer(msg.value);
        
        // Change Owner
        _post.owner = msg.sender;
        
        //Remove from martketplace
        _post.martketplace = false;
       
        // Update the image
        originalPosts[_postId] = _post;
        
      }  

      function repost(uint256 _postId) public {
        // Make sure the id is valid
        require(_postId > 0 && _postId <= originalPostCount);

        // Fetch the Post
        OriginalPost memory _post = originalPosts[_postId];

        // Add to martketplace
        _post.martketplace = false;
       
        // Update the image
        originalPosts[_postId] = _post;
      }
      
}