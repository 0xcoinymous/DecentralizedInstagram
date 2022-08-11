$(function () {
    $(window).load(function () {
        PrepareNetwork();
    });
});

var JsonContract = null;
var web3 = null;
var MyContract = null;
var Owner = null;
var CurrentAccount = null;
var PostCounter = null;
var IPFS_Hash = null;
var Host_Name = 'https://ipfs.infura.io/ipfs/';
var Content = null;
var flag = 0;
const d = new Date();


const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

function makeHttpObject() {
    if ("XMLHttpRequest" in window) return new XMLHttpRequest();
    else if ("ActiveXObject" in window) return new ActiveXObject("Msxml2.XMLHTTP");
}

async function PrepareNetwork() {
    await loadWeb3();
    await LoadDataSmartContract();
}

async function loadWeb3() {

    if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        await ethereum.request({ method: 'eth_requestAccounts' }).then(function (accounts) {
            CurrentAccount = accounts[0];
            web3.eth.defaultAccount = CurrentAccount;
            console.log('current account: ' + CurrentAccount);
            setCurrentAccount();
        });
    }
    else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider);
    }
    else {
        window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }

    ethereum.on('accountsChanged', handleAccountChanged);
    ethereum.on('chainChanged', handleChainChanged);

}

function setCurrentAccount() {
    $('#Address').text(CurrentAccount);
}

async function handleAccountChanged() {
    await ethereum.request({ method: 'eth_requestAccounts' }).then(function (accounts) {
        CurrentAccount = accounts[0];
        web3.eth.defaultAccount = CurrentAccount;
        console.log('current account: ' + CurrentAccount);
        setCurrentAccount();
        window.location.reload();
    });
}

async function handleChainChanged(_chainId) {

    window.location.reload();
    console.log('Chain Changed: ', _chainId);
}

async function LoadDataSmartContract() {
    await $.getJSON('Instagram.json', function (contractData) {
        JsonContract = contractData;
    });

    web3 = await window.web3;

    const networkId = await web3.eth.net.getId();

    const networkData = JsonContract.networks[networkId];
    if (networkData) {
        MyContract = new web3.eth.Contract(JsonContract.abi, networkData.address);

        PostCounter = await MyContract.methods.PostCounter().call();
        console.log('PostCounter: ', PostCounter);
        ShowPost();
    }
    $(document).on('click', '#newpost', newpost);

}

function newpost() {

    var description = $("#description").val();
    if (description.trim() == '') {
        window.alert("Please Fill Description!");
        return;
    }

    MyContract.methods.UplodPost(IPFS_Hash, description, d.toString()).send({ from: CurrentAccount }).then(function (Instance) {

        window.alert("Post Created By" + Instance.events.PostCreated.returnValues[3]);
        window.location.reload();


    }).catch(function (error) {
        window.alert("err" + error);
        console.log("error: " + error)
    });

    ShowPost();

}

async function addLike(id) {

    // console.log("id : ", id);
    var wholiked = await MyContract.methods.getLike(id).call();
    console.log("wholiked : ", wholiked);

    const found = await wholiked.find(element => element.toLowerCase() == CurrentAccount);
    console.log("found : ", found);

    if (wholiked.length > 0 && found != undefined) {
        if (found.toLowerCase() == CurrentAccount) {
            MyContract.methods.SubLike(id).send({ from: CurrentAccount }).then(async function (Instance) {
                window.alert("Post Sub Likes");
                let post = await MyContract.methods.getPost(id).call();

                var idtag = "#like" + id;
                $(idtag).html(post.likeCounter);

            }).catch(function (error) {

                window.alert(error);
                console.log(error);

            });

        } else {

            MyContract.methods.AddLike(id).send({ from: CurrentAccount }).then(async function (Instance) {

                window.alert("post likes added!");

                let post = await MyContract.methods.getPost(id).call();

                var idtag = "#like" + id;
                $(idtag).html(post.likeCounter);

            }).catch(function (error) {

                window.alert(error);
                console.log(error);

            });

        }

    } else {
        MyContract.methods.AddLike(id).send({ from: CurrentAccount }).then(async function (Instance) {
            window.alert("post likes added!");

            let post = await MyContract.methods.getPost(id).call();

            var idtag = "#like" + id;
            $(idtag).html(post.likeCounter);

        }).catch(function (error) {

            window.alert(error);
            console.log(error);

        });

    }

}

async function adddisLike(id) {

    // console.log("id : ", id);
    var userDisliked = await MyContract.methods.getdisLike(id).call();
    console.log("userDisliked : ", userDisliked);

    const found = await userDisliked.find(element => element.toLowerCase() == CurrentAccount);
    console.log("found : ", found);

    if (userDisliked.length > 0 && found != undefined) {
        if (found.toLowerCase() == CurrentAccount) {
            MyContract.methods.SubdisLike(id).send({ from: CurrentAccount }).then(async function (Instance) {

                window.alert("post dislikes subtracted! ")

                let post = await MyContract.methods.getPost(id).call();

                var idtag = "#dislike" + id;
                $(idtag).html(post.disLikeCounter);

            }).catch(function (error) {

                window.alert(error);
                console.log(error);


            });



        } else {

            MyContract.methods.AdddisLike(id).send({ from: CurrentAccount }).then(async function (Instance) {

                window.alert("post dislides added! ")

                let post = await MyContract.methods.getPost(id).call();

                var idtag = "#dislike" + id;
                $(idtag).html(post.disLikeCounter);

            }).catch(function (error) {

                window.alert(error);
                console.log(error);

            });

        }

    } else {
        MyContract.methods.AdddisLike(id).send({ from: CurrentAccount }).then(async function (Instance) {

            window.alert("post dislikes added!")
            let post = await MyContract.methods.getPost(id).call();

            var idtag = "#dislike" + id;
            $(idtag).html(post.disLikeCounter);

        }).catch(function (error) {

            window.alert(error);
            console.log(error);

        });

    }


}

function previewFile() {

    const file = document.querySelector('input[type=file]').files[0];

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.addEventListener("load", async function () {

        //   console.log('result : ', reader.result);

        Content = reader.result;

        if (flag == 0) {
            var br = '<br>';
            $('#showimgnft').append(br);
            var newEleman = '<img id = "nftimg" src = "#">' + '</img>';
            $('#showimgnft').append(newEleman);
        }
        flag = 1;

        $("#nftimg").attr("src", Content);

        $("#overlay").fadeIn(300);

        await ipfs.add(Content, function (err, hash) {

            if (err) {

                console.log("IPFS ERROR when tried to add picture to IPFS! ")

                return false;
            } else {
                IPFS_Hash = hash;
                console.log('IPFS_Hash : ', IPFS_Hash);
                $("#overlay").fadeOut(300);
            }

        });

    });

}

async function ShowPost() {

    $("#overlay").fadeIn(300);

    PostCounter = await MyContract.methods.PostCounter().call();

    for (let index = PostCounter - 1; index >= 0; index--) {
        await CreatePostDesign(index);

        let post = await MyContract.methods.getPost(index).call();
        console.log(post.commentCounter);
        await CreateComment(index, post.commentCounter);

    }


    $("#overlay").fadeOut(300);
}

function sleep(ms) {

    return new Promise(resolve => setTimeout(resolve, ms));

}

async function CreatePostDesign(index) {

    let post = await MyContract.methods.getPost(index).call();
    // console.log("post : ",post);

    var dateCheck = post.date.slice(4, 25);
    getImageSRC(post.hashImage);

    await sleep(100);

    // var htmlTag =
    //     '<div class="loadMore">' +
    //     '<div class="central-meta item">' +
    //     '<div class="user-post">' +
    //     '<div class="friend-info">' +
    //     '<div class="friend-name">' +
    //     '<ins><a href="#" title="">' + post.author + '</a></ins>' +
    //     '<span>published: ' + dateCheck + '</span>' +
    //     '</div>' +
    //     '<hr>' +
    //     '<div class="post-meta">' +
    //     '<img src=' + Content + ' alt="" id = "ShowIMG">' +

    //     '<div class="we-video-info">' +
    //     '<ul>' +
    //     '<li>' +
    //     '<span class="comment" data-toggle="tooltip" title="Comments">' +
    //     '<i class="fa fa-comments-o"></i>' +
    //     '<ins id = "">' + post.commentCounter + '</ins>' +
    //     '</span>' +
    //     '</li>' +
    //     '<li>' +
    //     '<span class="like" data-toggle="tooltip" title="like">' +
    //     '<i class="ti-heart" onclick = "addLike(' + post.id + ')"></i>' +
    //     '<ins id = "like' + index + '">' + post.likeCounter + '</ins>' +
    //     '</span>' +
    //     '</li>' +
    //     '<li>' +
    //     '<span class="dislike" data-toggle="tooltip" title="dislike">' +
    //     '<i class="ti-heart-broken" onclick = "adddisLike(' + post.id + ')"></i>' +
    //     '<ins id = "dislike' + index + '">' + post.disLikeCounter + '</ins>' +
    //     '</span>' +
    //     '</li>' +
    //     '<li>' +
    //     '<span class="like" data-toggle="tooltip" title="Tip" style = "color:purple;">' +
    //     '<i class="fa fa-dollar" onclick = "CheckTip(' + post.id + ')"></i>' +
    //     '<ins id = "tip' + index + '">' + web3.utils.fromWei(post.tipAmount, 'ether') + ' ether</ins>' +
    //     // '<input type="number" id="quantity" name="quantity" min="1" step="any">'+
    //     '</span>' +
    //     '</li>' +
    //     '<li>' +
    //     '<span class="like" data-toggle="tooltip" title="Tip" style = "color:purple;">' +
    //     //'  <input type="number" id="quantity" name="quantity" min="0" step="0.01">'+
    //     '<input type="currency"  placeholder="ETH Tip" id = "tipValue' + index + '" />' +
    //     '</span>' +
    //     '</li>' +
    //     '</ul>' +
    //     console.log("post.id & index compare :" + post.id + "==" + index)  // so these are equal here.
    // '</div>' +
    //     //  '<hr/>'+
    //     '<div class="description">' +
    //     '<p style = "color:black;">' + post.description + '</p>' +
    //     '</div>' +
    //     // '<hr>'+
    //     '</div>' +
    //     '</div>' +

    //     '<div class="coment-area">' +
    //     '<li class="post-comment">' +
    //     '<div style = "color : #7FBA00;">' + CurrentAccount + '</div' +
    //     '<div class="post-comt-box">' +
    //     '<div>' +
    //     '<textarea placeholder="Post your comment" id = "comment' + index + '"></textarea>' +
    //     '<button onclick = "AddComment(' + post.id + ')" class="btn btn-primary">Comment</button>' +
    //     '</div>' +
    //     '</div>' +
    //     '</li>' +

    //     '<li id = "comments' + index + '">' +

    //     '</li>' +
    //     '</div>' +

    //     '</div>' +
    //     '</div>' +
    //     '</div>';
//-------------------------------------------------------------------------------------------------------------------------------
    var htmlTag = 
    '<div class="loadMore">'+ 
        '<div class="central-meta item">'+
            '<div class="user-post">'+
                '<div class="friend-info">'+
                    '<div class="friend-name">'+
                        '<ins><a href="#" title="">'+ post.author +'</a></ins>'+
                        '<span>published: '+dateCheck+'</span>'+
                    '</div>'+
                    '<hr>'+
                    '<div class="post-meta">'+
                        '<img src='+ Content +' alt="" id = "ShowIMG">'+
                        
                        '<div class="we-video-info">'+
                            '<ul>'+
                                '<li>'+
                                    '<span class="comment" data-toggle="tooltip" title="Comments">'+
                                    '<i class="fa fa-comments-o"></i>'+
                                    '<ins id = "">'+ post.commentCounter +'</ins>'+
                                    '</span>'+
                                '</li>'+
                                '<li>'+
                                    '<span class="like" data-toggle="tooltip" title="like">'+
                                    '<i class="ti-heart" onclick = "addLike('+ post.id +')"></i>'+
                                    '<ins id = "like'+index+'">'+ post.likeCounter +'</ins>'+
                                    '</span>'+
                                '</li>'+
                                '<li>'+
                                    '<span class="dislike" data-toggle="tooltip" title="dislike">'+
                                    '<i class="ti-heart-broken" onclick = "adddisLike('+ post.id +')"></i>'+
                                    '<ins id = "dislike'+index+'">'+ post.disLikeCounter +'</ins>'+
                                    '</span>'+
                                '</li>'+
                                '<li>' +
                                    '<span class="like" data-toggle="tooltip" title="Tip" style = "color:purple;">' +
                                    '<i class="fa fa-dollar" onclick = "CheckTip(' + post.id + ')"></i>' +
                                    '<ins id = "tip' + index + '">' + web3.utils.fromWei(post.tipAmount, 'ether') + ' ether</ins>' +
                                    // '<input type="number" id="quantity" name="quantity" min="1" step="any">'+
                                    '</span>' +
                                '</li>' +
                                '<li>' +
                                    '<span class="like" data-toggle="tooltip" title="Tip" style = "color:purple;">' +
                                    //'  <input type="number" id="quantity" name="quantity" min="0" step="0.01">'+
                                    '<input type="currency"  placeholder="ETH Tip" id = "tipValue' + index + '" />' +
                                    '</span>' +
                                '</li>' +
                            '</ul>'+
                        '</div>'+
                        //  '<hr/>'+
                        '<div class="description">'+
                            '<p style = "color:black;">'+ post.description +'</p>'+
                        '</div>'+
                        // '<hr>'+
                    '</div>'+
                '</div>'+

                '<div class="coment-area">'+
                '<li class="post-comment">'+
                    '<div style = "color : #7FBA00;">'+CurrentAccount +'</div'+
                    '<div class="post-comt-box">'+
                        '<div>'+
                            '<textarea placeholder="Post your comment" id = "comment'+index+'"></textarea>'+									
                            '<button onclick = "AddComment('+ post.id +')" class="btn btn-primary">Comment</button>'+
                        '</div>'+
                    '</div>'+
                '</li>'+

                '<li id = "comments'+index+'">'+
               
                '</li>'+
            '</div>'+

            '</div>'+
        '</div>'+
    '</div>';    

    $("#test").append(htmlTag);


}

function getImageSRC(HashIMG) {

    var imgURL = Host_Name + HashIMG;

    var request = makeHttpObject();
    request.open("GET", imgURL, true);
    request.send(null);
    request.onreadystatechange = function () {
        if (request.readyState == 4) {
            Content = request.responseText;
            //   console.log("Content : ",Content);
        }

    }

}

function AddComment(id) {

    var cmid = "#comment" + id;
    var comment = $(cmid).val();
    console.log(comment);
    if (comment.trim() == '') {

        window.alert("Please fill the comment box please!")
        return;
    }

    MyContract.methods.AddComment(id, comment, d.toString()).send({ from: CurrentAccount }).then(function (Instance) {

        window.alert("comment created succesfully by : " + Instance.events.CommentCreated.returnValues[3])


    }).catch(function (error) {

        window.alert(error);
        console.log(error);

    });


}

async function CreateComment(id, cmidx) {

    CM = await MyContract.methods.getComments(id).call();
    // console.log("cmidx : " + cmidx);
    // console.log("CMcounter"+CMcounter);

    for (let index = cmidx - 1; index >= 0; index--) {

        CreateCommentDesign(CM[index], id);
       //  console.log("CM : " + CM[index]);

    }


}

function CreateCommentDesign(CM, id) {

    let datecomment = CM.date.slice(4, 25);

    var htmlTagC =
        '<div class="we-comment">' +
            '<div class="coment-head">' +
                '<h5><a href="#" title="" style = "color:blue;">' + CM.author + '</a></h5>' +
                '<span>' + datecomment + '</span>' +
            '</div>' +
            '<p style = "color:black;">' + CM.comment + '</p>' +
        '</div>' +
        '<br>';
        
    let idcomment = "#comments" + id;
    $(idcomment).append(htmlTagC);
}

function CheckTip(id) {

    var TipId = "#tipValue" + id;

    // var tipAmount = Number($(TipId).val());
    var tipAmount = $(TipId).val();
    console.log("tip Amount :" + tipAmount);

    // console.log(typeof(tipAmount));

    if (Number(tipAmount) <= 0) {
        window.alert("Fill the tip box please !");
        return;
    }

    Tip(id, tipAmount);

}

function Tip(id, tip) {

    let tipAmount = web3.utils.toWei(tip, 'ether');
    console.log("tipAmount:" + tipAmount);

    MyContract.methods.TipPosts(id).send({ from: CurrentAccount, value: tipAmount }).then(async function (Instance) {
        window.alert("Thank you for your tip (amount : " + Instance.events.TipPosted.returnValues[1] + " Wei)")
        window.location.reload();

    }).catch(function (error) {
        console.log(error);

    });

}