/*
    聊天室主要功能
*/ 

/*
    1.连接socket.io 服务
*/ 

var socket = io('http://127.0.0.1:3000')
var username,avatar

// 2.登录功能
$('#login_avatar li').on('click', function() {
    $(this).addClass('now').siblings().removeClass('now')
})

// 点击登录
$('#loginBtn').on('click', function() {
    // 获取用户名
    var username = $('#username').val().trim()
    if(!username) {
        alert('请输入用户名！！！')
        return
    }
    // 获取选择的头像
    var avatar = $('#login_avatar li.now img').attr('src')
    
    // 需要告诉socket.io 服务，登录
    socket.emit('login', {
        username,
        avatar
    })
})

// 监听登录失败的请求
socket.on('loginError', data => {
    alert('登录失败,用户名已经存在')
})

// 监听登录成功的请求
socket.on('loginSuccess', data => {
    // 需要隐藏登录框，显示聊天窗口
    $('.login_box').fadeOut()
    // $('.background').hide()
    $('.container').fadeIn()

    // 设置个人信息
    $('.avatar_url').attr('src', data.avatar)
    $('.header .username').text(data.username)

    username = data.username
    avatar = data.avatar
})

//  监听添加用户的消息
socket.on('addUser', data => {
    // 添加一条系统消息
    $('.box-bd').append(`
        <div class="system">
            <p class="message_system">
                <span class="content">${data.username}加入了群聊</span>
            </p>
        </div>
    `)
    scrollIntoView()
})

// 监听用户列表的消息
socket.on('usersList', data => {
    // 把userslist中的数据动态渲染到左侧菜单
    $('.user-list ul').html('')
    data.forEach(item => {
        $('.user-list ul').append(`
            <li class="user">
                <div class="avatar"><img src="${item.avatar}" alt=""></div>
                <div class="name">${item.username}</div>
            </li>
        `)
    })
    $('#userCount').text(data.length)
})

//  监听用户离开的消息
socket.on('delUser', data => {
    // 添加一条系统消息
    $('.box-bd').append(`
        <div class="system">
            <p class="message_system">
                <span class="content">${data.username}离开了群聊</span>
            </p>
        </div>
    `)
    scrollIntoView()
})

// 聊天功能
function submit () {
    // 获取到聊天的内容
    var content = $('#content').html().trim()
    $('#content').html('')
    if (!content) return alert('请输入消息内容')

    // 发送给服务器
    socket.emit('sendMessage', {
        msg: content,
        username,
        avatar
    }) 
}
// 点击发送键
$('.btn-send').on('click', () => {
    submit()
})
// 快捷键ctrl+enter
$(document).keydown(function(e) {
    if(e.ctrlKey && e.which == 13) {
        submit()
    }
})

// 监听聊天的消息
socket.on('receiveMessage',data => {
    // 把接受到的消息显示到聊天窗口中
    if(data.username === username) {
        // 自己的消息
        $('.box-bd').append(`
            <div class="message-box">
                <div class="my message">
                    <img class="avatar" src="${data.avatar}" alt="">
                    <div class="content">
                        <div class="bubble">
                            <div class="bubble_cont">${data.msg}</div>
                        </div>
                    </div>
                </div>
            </div>
        `)
    } else {
        // 别人 的消息
        $('.box-bd').append(`
            <div class="message-box">
                <div class="other message">
                    <img class="avatar" src="${data.avatar}" alt="">
                    <div class="content">
                        <div class="nickname">${data.username}</div>
                        <div class="bubble">
                            <div class="bubble_cont">${data.msg}</div>
                        </div>
                    </div>
                </div>
            </div>
        `)
    }
    scrollIntoView()
})

function scrollIntoView() {
    // 当前元素的底部要滚动到可以区域
    $('.box-bd').children(':last').get(0).scrollIntoView(false)
}

$('.file').on('click', function() {
    $('#file')[0].click()
})

// 发送文件图片功能
$('#file').on('change', function() {
    var file = this.files[0]

    // 需要把这个文件发送到服务器，接借助H5新增的fileReader
    var fr = new FileReader()
    fr.readAsDataURL(file)
    fr.onload = function() {
        // console.log(fr.result);
        socket.emit('sendImage', {
            username,
            avatar,
            img: fr.result
        })
    }
})

// 监听图片聊天信息
socket.on('receiveImage',data => {
    // 把接受到的消息显示到聊天窗口中
    if(data.username === username) {
        // 自己的消息
        $('.box-bd').append(`
            <div class="message-box">
                <div class="my message">
                    <img class="avatar" src="${data.avatar}" alt="">
                    <div class="content">
                        <div class="bubble">
                            <div class="bubble_cont">
                                <img src="${data.img}"/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `)
    } else {
        // 别人 的消息
        $('.box-bd').append(`
            <div class="message-box">
                <div class="other message">
                    <img class="avatar" src="${data.avatar}" alt="">
                    <div class="content">
                        <div class="nickname">${data.username}</div>
                        <div class="bubble">
                            <div class="bubble_cont">
                                <img src="${data.img}"/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `)
    }
    // 等待图片加载完成
    $('.box-bd img:last').on('load', function(){
        scrollIntoView()
    })
})

// 初始化jquery-emoji插件
$('.face').on('click', function() {
    $('#content').emoji({
        // 设置触发表情的按钮
        button: '.face',
        showTab: false,
        animation: 'slide',
        position: 'topRight',
        icons: [
            {
                name: "动态表情",
                path: "./lib/jquery-emoji/img/qq/",
                maxNum: 91,
                excludeNums: [41, 45, 54],
                file: ".gif"
            },
            {
                name: "emoji",
                path: "./lib/jquery-emoji/img/emoji/",
                maxNum: 91,
                excludeNums: [41, 45, 54],
                file: ".png"
            },
            {
                name: "图片表情",
                path: "./lib/jquery-emoji/img/tieba/",
                maxNum: 91,
                excludeNums: [41, 45, 54],
                file: ".jpg"
            }
        ]
    })
})