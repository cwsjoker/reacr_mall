import React, { Component } from 'react';

export default function Footer() {
    return (
        <div className="footerDiv">
            <div className="footer w1200">
                <div className="fooL fl">
                    <div></div>
                    <p>Copyright C 2018 bttmall</p>
                </div>
                <div className="fooR fr">
                    <ul>
                        <li>
                            <h2>服务</h2>
                            <a href="#">交易中心</a>
                            <a href="#">帮助中心</a>
                            <a href="#">提交请求</a>
                            <a href="#">申请成为推荐机构</a>
                        </li>
                        <li>
                            <h2>条款说明</h2>
                            <a href="#">隐私政策</a>
                            <a href="#">用户协议</a>
                            <a href="#">手续费</a>
                        </li>
                        <li>
                            <h2>关于我们</h2>
                            <a href="#">客户支持</a>
                            <a href="#">联系我们</a>
                        </li>
                        <li>
                            <h2>社区</h2>
                            <a href="#">帮助中心</a>
                            <a href="#">提交请求</a>
                            <a href="#">申请成为推荐机构</a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}