import React, { Component } from 'react';
import { withRouter } from 'react-router'
import { Spin } from 'antd';
import $home_api from '../../fetch/api/home.js'


class Recommend extends Component {
    constructor() {
        super();
        this.state = {
            daily_list: [],
            daily_spinning: true,
            hot_list: [],
            hot_list_spinning: true,
        }
    }
    componentDidMount() {
        $home_api.getDailyList().then(res => {
            if (res) {
                this.setState({
                    daily_list: res.data.data,
                    daily_spinning: false
                })
            }
        })
        $home_api.getHotList().then(res => {
            if (res) {
                this.setState({
                    hot_list: res.data.data,
                    hot_list_spinning: false
                })
            }
        })
    }
    goto(id) {
        this.props.history.push('/goodsDetail?goodsId='+id)
    }
    render() {
        const { daily_list, daily_spinning, hot_list_spinning } = this.state;
        return (
            <div className="recommend-main">
                <div className="recommend-daily">
                    <div className="home-tip-title">
                        <i></i>
                        <h2>每日精选</h2>
                        <span>智能潮货 嗨购不停</span>
                    </div>
                    <div>
                    <Spin tip="Loading..." spinning={daily_spinning}>
                        <ul className="siftList">
                            {
                                daily_list.map((item, index) => {
                                    return (
                                        <li key={item.id} style={(index + 1) % 3 === 0 ? {marginRight: '0px'} : {marginTop: '10px'}} onClick={this.goto.bind(this, item.goodsId)}>
                                            <a href="javascript:;">
                                                <img src={window.BACK_URL + item.imageUrl} />
                                                <h2>{item.goodsName}  {index}</h2>
                                                <p>{item.inventoryIntroduce}</p>
                                                <h3>{item.price} {item.symbol}</h3>
                                            </a>
                                        </li>
                                    )
                                })
                            }
                        </ul>
                    </Spin>

                    </div>
                </div>
                <div className="recommend-hot">
                    <div className="home-tip-title">
                        <i></i>
                        <h2>热门推荐</h2>
                        <span>智能潮货 嗨购不停</span>
                    </div>
                    <Spin tip="Loading..." spinning={hot_list_spinning}>
                        <ul className="hotList">
                            {
                                this.state.hot_list.map(item => {
                                    return (
                                        <li key={item.id} onClick={this.goto.bind(this, item.goodsId)}>
                                            <div className="hotDiv">
                                                {/* <span v-if="hot.ifShow" class="hotIco">自营</span> */}
                                                <div href="javascript:;">
                                                    <img src={window.BACK_URL + item.imageUrl} />
                                                    <h2>{item.goodsName}</h2>
                                                    <p>{item.inventoryIntroduce}</p>
                                                    <h3>{item.price} {item.symbol}</h3>
                                                </div>
                                                <div className="btnDiv">
                                                    <div href="javascript:;">立即购买</div>
                                                </div>
                                            </div>
                                        </li>
                                    )
                                })
                            }
                        </ul>
                    </Spin>
                </div>
            </div>
        )
    }
}

export default withRouter(Recommend);