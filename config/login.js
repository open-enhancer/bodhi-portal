module.exports = function(req, res, next) {
	req.session.user = {
        id: '123456',
        name: '张三',
        roles: '员工',
        department: '部门',
        avatar: 'https://portal.site.com/avatar.jpg'
    };
	res.send({success: true});
};