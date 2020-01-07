<template>
  <div class="login-container">
    <div class="login-box">
      <!-- 绘制form表单 -->
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules">
        <img src="./logo_index.png" alt />
        <!-- 手机号 -->
        <!-- prop是的校验规则可以找到当前目录进行匹配校验，值 就是当前项目名称 -->
        <el-form-item prop="mobile">
          <el-input v-model="loginForm.mobile" placeholder="请输入手机号"></el-input>
        </el-form-item>
        <!-- 验证码 -->
        <el-form-item prop="code">
          <el-input v-model="loginForm.code" placeholder="请输入验证码"></el-input>
        </el-form-item>
        <!-- 协议 -->
        <el-form-item style="text-align:left" prop="xieyi">
          <el-checkbox v-model="loginForm.xieyi">
            <span>
              我已阅读并同意
              <a href="#">用户协议</a>和
              <a href="#">隐私条款</a>
            </span>
          </el-checkbox>
        </el-form-item>
        <el-form-item>
          <el-button style="width:100%;" type="primary" @click="login()">登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
// 导入极验的gt.ji文件（gt.js文件本身没有做模块导出动作）
// 内部有名称为 initGeetest 的全局变量
import './gt.js'
export default {
  // 注意：属性绑定、双向数据绑定的值需要通过data做支持
  data () {
    // 声明局部函数，实现校验
    var xieyiTest = function (rule, value, callback) {
      // rule:校验规则，一般无用
      // value: 被校验的数据
      // callback: 回调函数，校验成功或失败都要执行之
    //   if (value) {
    //     // 校验通过
    //     callback()
    //     // 校验不通过
    //   } else {
    //     callback(new Error('请遵守协议'))
    //   }
      value ? callback() : callback(new Error('请遵守协议'))
    }
    return {
      loginForm: {
        mobile: '13987654321', // 手机号码
        code: '246810', // 校验码
        xieyi: false // 协议
      },
      // 表单校验
      loginFormRules: {
        // 项目名称[
        // {具体校验规则},
        // {具体校验规则}
        // 规则: required:项目必填
        // message:错误提示
        // min:信息长度最小限制
        // max:信息长度最大限制
        // ]
        // 手机号码
        mobile: [
          { required: true, message: '手机号码必填' },
          { pattern: /^1[35789]\d{9}$/, message: '手机号码格式不正确' }
        ],
        // 验证码
        code: [{ required: true, message: '验证码必填' }],
        // 协议
        // {validator:函数名字} // 自定义校验
        xieyi: [{ validator: xieyiTest }]
      }
    }
  },
  methods: {
    login () {
      // 表单要做校验
      // el-form表单对象.validate()
      // console.log(this)
      // this.$refs.loginFormRef // 获得el-form的组件对象
      // this.$refs.loginFormRef.validate(回调函数)
      this.$refs.loginFormRef.validate(valid => {
        // valid:true 校验通过
        // valid:false 校验失败
        // 校验失败，代码停止
        if (!valid) {
          return false
        }
        // A.人机交互验证
        // axios获得极验的密钥信息
        let pro = this.$http({
          url: '/mp/v1_0/captchas/' + this.loginForm.mobile,
          method: 'get'
        })
        pro
          .then(result => {
            console.log(result)// 极验的密钥信息
            // 从result里边解构下述的data对象出来(对象结构赋值)
            let { data } = result.data
            // 请检测data的数据结构， 保证data.gt, data.challenge, data.success有值
            window.initGeetest({
            // 以下配置参数来自服务端 SDK
              gt: data.gt,
              challenge: data.challenge,
              offline: !data.success,
              new_captcha: true,
              product: 'bind'
            }, captchaObj => {
            // 这里可以调用验证实例 captchaObj 的实例方法
              captchaObj.onReady(() => {
                // 验证码ready之后才能调用verify方法显示验证码
                captchaObj.verify() // 显示验证码
              }).onSuccess(() => {
                // 行为校验正确的处理
                // B.验证账号，登陆系统
                this.loginAct()
              }).onError(() => {
                // 行为校验不正确的处理
              })
            })
          })
          .catch(err => {
            return this.$message.error('获取极验密钥失败:' + err)
          })

        // this.$router.push('/home')
        // this.$router.push({ name: 'home' })
      })
    },

    // 账号真实性校验，并登录系统
    loginAct () {
      // 服务端账号真实校验
      let pro = this.$http({
        url: '/mp/v1_0/authorizations',
        method: 'POST',
        data: this.loginForm
      })
      pro
        .then(result => {
          // 客户端浏览器把服务器端返回的秘钥等相关信息通过 sessionStorage 做记录，表明是登录状态
          window.sessionStorage.setItem('userinfo', JSON.stringify(result.data.data))
          // 进入后台系统
          this.$router.push({ name: 'home' })
        })
        .catch(err => {
          // 通过弹框把错误显示出来
          this.$message.error('手机号码或验证码错误:' + err)
        })
    }
  }
}
</script>

<style lang="less" scoped>
.login-container {
  height: 100%;
  background-color: gray;
  background-image: url("./login_bg.jpg");
  background-size: cover;
  display: flex;
  justify-content: center;
  align-items: center;
  .login-box {
    width: 410px;
    height: 345px;
    background-color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    img {
      width: 50%;
      margin: 20px auto;
    }
    .el-form {
      width: 75%;
    }
  }
}
</style>
