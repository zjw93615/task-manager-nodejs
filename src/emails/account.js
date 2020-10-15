const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'playwithnodejs@em1849.jiawei.space',
        subject: '欢迎加入Task Manager',
        text: `您好，${name}！您的账号已经成功创建，请使用密码进行登陆。`
    })
}

const sendResetPassword = (email, link) => {
    sgMail.send({
        to: email,
        from: 'playwithnodejs@em1849.jiawei.space',
        subject: 'Task Manager重新设置密码',
        html: `<p>您收到此邮件是因为您（或其他人）已要求重设帐户密码。请单击以下链接，或将其粘贴到浏览器中以完成该过程：<a href="${link}">${link}</a>。链接有效时长为一小时。</p>`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendResetPassword
}

