// SPDX-License-Identifier: MIT

pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/Address.sol";


contract Instagram is Context {
    using Address for address;

    struct Post {
        uint256 id;
        uint256 likeCounter;
        uint256 disLikeCounter;
        uint256 commentCounter;
        uint256 tipAmount;
        string hashImage;
        string description;
        string date;
        address payable author;
    }

    struct Comment {
        uint256 id;
        string comment;
        string date;
        address author;
    }

    mapping(uint256 => Post) public posts; //posts[0] = post
    mapping(uint256 => mapping(uint256 => Comment)) comments; // comments[idpost][idcomment] = comment
    mapping(uint256 => mapping(uint256 => address)) likes; // likes[idpost][likecounter] = address
    mapping(uint256 => mapping(uint256 => address)) dislikes;

    event PostCreated(
        uint256 id,
        string hashimage,
        string description,
        address payable author
    );

    event CommentCreated(
        uint256 idpost,
        uint256 idcomment,
        string comment,
        address author
    );

    event TipPosted(
        uint256 id,
        uint256 tipamount,
        address currentaccount,
        address payable author
    );

    uint256 public PostCounter;

    function UplodPost(
        string memory hashimg,
        string memory des,
        string memory date
    ) public {
        require(bytes(hashimg).length > 0, "Instagram:This Hash Incorrect");
        require(bytes(des).length > 0, "Instagram:This Description Incorrect");
        require(_msgSender() != address(0), "Instagram:This Hash Incorrect");

        posts[PostCounter] = Post(
            PostCounter,
            0,
            0,
            0,
            0,
            hashimg,
            des,
            date,
            payable(_msgSender())
        );
        PostCounter++;

        emit PostCreated(PostCounter, hashimg, des, payable(_msgSender()));
    }

    function getPost(uint256 _id) public view returns (Post memory) {
        require(
            _id >= 0 && _id < PostCounter,
            "Insragram: This Id AddLike Incorrect"
        );
        return posts[_id];
    }

    function AddLike(uint256 _id) public {
        require(
            _id >= 0 && _id < PostCounter,
            "Insragram: This Id AddLike Incorrect"
        );

        uint256 numberlike = posts[_id].likeCounter;
        posts[_id].likeCounter++;
        likes[_id][numberlike] = _msgSender();
    }

    function SubLike(uint256 _id) public {
        require(
            _id >= 0 && _id < PostCounter,
            "Insragram: This Id SubLike Incorrect"
        );

        uint256 numberlike = posts[_id].likeCounter;
        posts[_id].likeCounter--;
        delete likes[_id][numberlike];
    }

    function getLike(uint256 _id) public view returns (address[] memory) {
        address[] memory ret = new address[](posts[_id].likeCounter);

        for (uint256 index = 0; index < posts[_id].likeCounter; index++) {
            ret[index] = likes[_id][index];
        }

        return ret;
    }

    function AdddisLike(uint256 _id) public {
        require(
            _id >= 0 && _id < PostCounter,
            "Insragram: This Id AdddisLike Incorrect"
        );

        uint256 numberdislike = posts[_id].disLikeCounter;
        posts[_id].disLikeCounter++;
        dislikes[_id][numberdislike] = _msgSender();
    }

    function SubdisLike(uint256 _id) public {
        require(
            _id >= 0 && _id < PostCounter,
            "Insragram: This Id SubdisLike Incorrect"
        );

        uint256 numberdislike = posts[_id].disLikeCounter;
        posts[_id].disLikeCounter--;
        delete dislikes[_id][numberdislike];
    }

    function getdisLike(uint256 _id) public view returns (address[] memory) {
        address[] memory ret = new address[](posts[_id].disLikeCounter);

        for (uint256 index = 0; index < posts[_id].disLikeCounter; index++) {
            ret[index] = dislikes[_id][index];
        }

        return ret;
    }

    function AddComment(
        uint256 _id,
        string memory comment,
        string memory date
    ) public {
        require(
            _id >= 0 && _id < PostCounter,
            "Insragram: This Id AddComment Incorrect"
        );

        require(
            bytes(comment).length > 0,
            "Instagram:This Description AddComment Incorrect"
        );

        uint256 count = posts[_id].commentCounter;
        comments[_id][count].id = count;
        comments[_id][count].comment = comment;
        comments[_id][count].date = date;
        comments[_id][count].author = _msgSender();

        posts[_id].commentCounter++;

        emit CommentCreated(_id, count, comment, _msgSender());
    }

    function getComments(uint256 _id) public view returns (Comment[] memory) {
        Comment[] memory ret = new Comment[](posts[_id].commentCounter);

        for (uint256 index = 0; index < posts[_id].commentCounter; index++) {
            ret[index] = comments[_id][index];
        }

        return ret;
    }

    function TipPosts(uint256 _id) public payable {
        require(
            _id >= 0 && _id < PostCounter,
            "Insragram: This Id AddComment Incorrect"
        );

        Post memory post = posts[_id];

        address payable authoraddress = post.author;
        Address.sendValue(authoraddress, msg.value);

        post.tipAmount += msg.value;

        posts[_id] = post;

        emit TipPosted(_id, msg.value, _msgSender(), authoraddress);

    }
}
