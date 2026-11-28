// ==UserScript==
// @name         抖音广告过滤（购物锚点 + 关键词）
// @namespace    dsh.local.douyin.adskip
// @version      7.0.0
// @description  识别广告角标/购物锚点/自定义关键词，自动跳过广告视频；二级层为功能入口，屏蔽标签、豁免标签、元素屏蔽、广告屏蔽可分别开关
// @author       lead
// @match        https://www.douyin.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @run-at       document-end
// ==/UserScript==

/* ============================================================
 * 抖音广告过滤脚本 v7.0.0 —— 完整免责声明
 *
 * 本注释块为完整声明，与同目录 DISCLAIMER.md 一致。
 * 下载、安装、运行、复制、修改或分发本项目的任何部分，
 * 即表示您已完整阅读、理解并接受以下全部内容。
 * 如不同意其中任何一项，请立即停止使用并删除本项目。
 *
 * 联系方式（仅用于权利通知与合规沟通）：luoxiashuang11@gmail.com
 * ============================================================
 * # 免责声明
 *
 * **项目名称**：抖音广告过滤脚本（`douyin-ad-skipper.user.js`）
 * **当前版本**：v5.5.0
 * **作者**：lead
 * **发布日期**：2026 年 11 月 22 日
 *
 * > **请先阅读**
 * > 本声明是本项目使用条件的组成部分。下载、安装、运行、复制、修改或分发本项目的任何部分，即表示您已完整阅读、理解并接受本声明的全部内容。如您不同意其中任何一项，请立即停止使用并删除本项目。
 * > 本声明不构成法律意见。如您对自身使用行为的合法性存有疑问，请咨询具备相应资质的专业人士。
 *
 * ---
 *
 * ## 一、项目性质
 *
 * 1. 本项目是个人开发者出于**学习、研究与技术交流**目的编写的浏览器用户脚本（UserScript），需在 Tampermonkey、Violentmonkey 等用户脚本管理器环境中运行。
 * 2. 本项目**不是**抖音、字节跳动或其关联公司的官方产品，**未获得**其授权、认可、赞助或技术支持，与上述主体**不存在**任何隶属、合作、代理或其他关联关系。
 * 3. 项目中出现的"抖音"等名称、商标、标识，其权利归相应权利人所有。本项目仅在说明兼容对象的必要范围内使用上述名称，不构成对任何商标权的取得、主张或授权。
 * 4. 本项目面向个人用户免费提供，用于非商业的学习与研究。作者保留变更授权方式的权利。
 *
 * ## 二、许可范围
 *
 * ### 2.1 授权使用
 *
 * 在遵守所在地法律法规以及您与相关平台之间协议的前提下，您可以：
 *
 * - 阅读、学习本项目的源代码，用于前端技术、DOM 操作、事件模拟等方向的学习与研究；
 * - 在您本人拥有或有权使用的设备上安装并运行本项目，对个人浏览体验作个性化调整；
 * - 在隔离的测试环境（测试账号、独立浏览器配置文件等）中验证功能；
 * - 按本声明第七节的条件转发、转载本项目。
 *
 * ### 2.2 禁止使用
 *
 * 您**不得**将本项目用于：
 *
 * 1. 任何商业用途，包括但不限于出售、出租、付费分发、捆绑销售，或作为付费产品或服务的组成部分；
 * 2. 任何违反中华人民共和国法律或您所在地法律的行为；
 * 3. 规避付费内容、会员权益、付费墙、加密保护或其他技术保护措施，或获取您无权访问的内容；
 * 4. 批量、自动化地抓取、采集、存储或传播平台数据及他人个人信息；
 * 5. 攻击、干扰、破坏平台或其他用户的正常服务，包括但不限于伪造流量、刷量、恶意消耗平台资源；
 * 6. 冒充官方产品、冒充权利人，或以任何方式使他人误认为本项目已获官方授权；
 * 7. 植入恶意代码、后门、数据回传、挖矿程序等损害使用者利益的功能。
 *
 * ### 2.3 权利保留
 *
 * 除本节明确授予的权利外，作者保留对本项目的全部权利。未取得作者事先书面许可，不得超出上述范围使用本项目。
 *
 * ## 三、风险告知
 *
 * **使用本项目存在现实风险。以下风险不会因您阅读或接受本声明而消失，也不会因本声明而转移给作者。**
 *
 * ### 3.1 风险速查
 *
 * | 风险类型 | 典型情形 | 可能性 | 可能后果 | 承担方 |
 * | --- | --- | --- | --- | --- |
 * | 账号与服务 | 平台判定存在自动化脚本干预 | 中 | 功能限制、内容下架、警告、封禁 | 使用者 |
 * | 兼容与误判 | 平台改版、页面结构变化 | 高 | 脚本失效、误跳过正常内容 | 使用者 |
 * | 法律与合规 | 被主张妨碍平台服务正常运行 | 低至中 | 民事索赔、行政责任 | 使用者 |
 * | 信息安全 | 安装来源不明的篡改版本 | 视来源而定 | 信息泄露、恶意代码执行 | 使用者 |
 *
 * ### 3.2 账号与服务风险
 *
 * 1. 平台用户协议通常禁止使用第三方插件、脚本或其他自动化手段干预其服务运行。使用本项目**可能被平台判定为异常行为或违规**，进而导致功能限制、内容下架、账号警告、临时封禁或永久封禁。
 * 2. 平台可能随时更新页面结构、接口或风控策略，导致本项目失效，或产生非预期行为（例如误跳过正常内容、误触其他控件）。
 * 3. 本项目通过模拟用户操作（点击、滚轮、键盘事件）实现内容切换。此类模拟事件缺少真实用户输入的可信属性，可能被平台的安全机制识别。
 *
 * ### 3.3 法律与合规风险
 *
 * 1. 相关法律禁止干扰他人网络正常功能，禁止妨碍、破坏其他经营者合法提供的网络产品或者服务的正常运行。本项目通过模拟用户输入改变平台既定的内容展示逻辑，在特定情形下**可能被主张落入上述规定的范围**，尤其是商业化使用、规模性使用，或已对平台造成实际影响时。
 * 2. 互联网广告应当显著标明关闭标志并确保一键关闭，这是法律对广告主、广告发布者设定的义务。本项目针对重复广告干扰浏览体验的问题而设计，但**该设计初衷不构成对本项目合法性的证明**，也不能排除第 1 项所述风险。
 * 3. 将本项目提供给他人、公开传播或用于经营场景，其法律风险通常**高于**个人在自有设备上的学习性使用；传播者、修改者可能因此承担独立责任。
 *
 * ### 3.4 技术与安全风险
 *
 * 1. 本项目按"现状"提供，可能存在缺陷、误判，或与特定浏览器版本、脚本管理器版本不兼容。
 * 2. 本项目以明文 JavaScript 形式分发，任何人均可修改。**请仅从您信任的来源获取本项目**，并在安装前自行核对代码内容与文件哈希（见第八节）。
 * 3. 安装用户脚本本身涉及在浏览器中执行第三方代码，请自行评估脚本管理器的安全设置与权限配置。
 *
 * ### 3.5 第三方权益
 *
 * 本项目的运行可能影响广告主、广告发布者及平台的商业利益。作者尊重上述主体的合法权益，无意通过本项目获取不正当利益，亦无意损害其正当经营。
 *
 * ## 四、数据处理说明
 *
 * **本项目的设计原则是：数据只留在您的设备上。**
 *
 * 经对 v5.5.0 版本源代码的核查，其技术特征如下：
 *
 * 1. **不含网络通信代码**。项目中没有 `fetch`、`XMLHttpRequest`、`sendBeacon`、`WebSocket` 或 `GM_xmlhttpRequest` 的调用，不会向任何服务器发送数据。
 * 2. **权限范围仅限本地存储**。所申请的用户脚本管理器权限为 `GM_setValue`、`GM_getValue`、`GM_deleteValue`，均用于在本机保存配置。
 * 3. **读取范围限于当前页面**。运行时会读取当前页面已渲染的可见文本与 DOM 结构（如视频描述、昵称、按钮文字）。这些读取**仅在本机内存中完成**，用于匹配您自行设定的关键词、白名单或元素规则，不写入磁盘，也不离开您的设备。
 * 4. **配置仅存本机**。您的配置（关键词、白名单、面板位置与大小、跳过统计等）仅保存在本机浏览器中，您可随时清除。
 * 5. **主动操作才涉及本地写入**。仅在您主动执行操作时（例如点击"导出配置"或"复制日志"），项目才可能调用浏览器剪贴板接口写入文本，或将内容以 JSON 文件保存到本机下载目录。这两个动作均由您本人触发，目标均为本机，不涉及任何上传。
 * 6. **会向页面注入界面元素，并接管右键菜单**。脚本会在页面角落注入一个浮窗按钮与设置面板，并在您右键点击页面时会拦截浏览器默认菜单、替换为脚本提供的"屏蔽/豁免"菜单（该行为可在设置中关闭）。这些注入元素随页面刷新消失，不写入磁盘，也不修改平台的服务端数据。
 * 7. **本地配置清单**。脚本通过 `GM_setValue`（不可用时回退 `localStorage`）在本机保存以下键，均以 `adskip.v2.` 开头：`pos`、`size`、`opacity`、`panelW`、`panelH`、`keywords`、`whitelist`、`keywordLimit`、`whitelistLimit`、`elementRules`、`enabled`、`flipDirection`、`giveUpOnFail`、`nextArrowDir`、`pickEnabled`、`scanFullPage`、`ignoreRightBar`、`showSkipToast`、`detectDelay`、`cooldown`、`stepWait`、`pollMs`、`maxPerMinute`。您可在用户脚本管理器中清除全部数据。
 * 8. **对页面性能的影响**。脚本以可配置的间隔（默认约 250ms）扫描当前可见区域的文本，并对元素规则做合并选择器查询。默认配置下开销很低；但若将扫描间隔调到极小、或配置数千条元素规则，会明显增加页面 CPU 占用，进而影响滚动与播放流畅度。此类配置由使用者自行选择，后果亦由其承担。
 * 9. **不修改平台数据，不上传内容**。脚本只改变本机的浏览行为（跳过当前内容），不发送评论、不点赞、不修改账号状态，也不将页面内容传输至外部。此点同样仅适用于原始版本，第三方修改版不受此约束。
 *
 * 需要特别说明：**上述特征仅适用于作者发布的原始版本**。任何第三方修改版都可能改变这些行为，作者无法保证其安全性，亦不对此承担责任。获取本项目时请核对第八节所列的文件哈希。
 *
 * ## 五、无担保
 *
 * 本项目按"现状"（AS IS）与"现有"（AS AVAILABLE）提供，不附带任何明示或默示的担保，包括但不限于：
 *
 * - 适销性、特定用途适用性的担保；
 * - 不侵权、无错误的担保；
 * - 持续可用、与平台长期兼容的担保；
 * - 检测准确性的担保（包括漏判与误判）。
 *
 * ## 六、责任限制
 *
 * 在适用法律允许的最大范围内：
 *
 * 1. 作者**不对**您因使用或无法使用本项目而产生的任何直接、间接、偶然、特殊、惩罚性或后果性损失承担责任，包括但不限于账号封禁或受限、数据丢失、设备损坏、利润损失、商誉损失及第三方索赔。
 * 2. 作者**不对**任何第三方修改版、转载版、二次打包版的行为、内容或安全性承担责任。
 * 3. 您理解并同意，使用本项目是您**自主、自愿**的决定，相关风险由您**自行评估并承担**。
 *
 * ## 七、转发、转载与修改
 *
 * 1. 您可以在保留本声明完整内容并注明原作者与来源的前提下，免费转发、转载或再分发本项目。
 * 2. 您对原始代码的任何修改由您**自行负责**；您应当在显著位置说明该版本经过修改，且**不得**以原作者名义发布。
 * 3. 您不得删除、篡改、规避或以任何方式使本声明失效。转载时**必须**随附本声明全文。
 * 4. 因您的分发、修改、宣传或使用行为引发的任何争议、索赔或法律责任，由您**独立承担**，与原作者无关。
 *
 * ## 八、文件完整性与来源核验
 *
 * 为防止他人以本项目名义分发被篡改的脚本，现公布当前版本的完整性信息，供下载后自行核对：
 *
 * - 文件名：`douyin-ad-skipper.user.js`
 * - 版本：`v5.5.0`
 * - 大小：见同目录 DISCLAIMER.md
 * - 行数：见同目录 DISCLAIMER.md
 * - SHA-256：【见 DISCLAIMER.md】
 *
 * Windows PowerShell 校验命令：
 *
 * ```powershell
 * Get-FileHash .\douyin-ad-skipper.user.js -Algorithm SHA256
 * ```
 *
 * 哈希值记录于同目录 DISCLAIMER.md。哈希不一致意味着文件已被修改，**请勿安装**。
 *
 * ## 九、权利通知与下架
 *
 * 1. 作者尊重他人的知识产权与其他合法权益。如任何权利人认为本项目侵犯其合法权益（包括但不限于著作权、商标权、商业秘密或其他权利），请通过下方联系方式告知作者，并提供权属证明与具体理由。
 * 2. 参照《中华人民共和国民法典》关于网络侵权"通知—删除"的处理思路，作者在核实后**将及时修改、删除相关内容或停止分发**。
 *
 * **联系方式**：`luoxiashuang11@gmail.com`（仅用于权利通知与合规沟通，不处理技术咨询或功能请求）
 *
 * ## 十、本声明的效力边界
 *
 * **请务必理解以下事实，以免对本声明产生误解：**
 *
 * 1. 本声明是作者对项目性质、使用范围与风险分配的**说明与约定**，其作用在于明确各方预期。它**不能**：
 *    - 免除作者依法应承担的责任；
 *    - 使违反法律强制性规定的行为合法化；
 *    - 作为使用者违反法律法规或平台协议的抗辩理由。
 * 2. 本声明的任何条款如被有管辖权的机关认定为无效或不可执行，**不影响**其余条款的效力。
 * 3. 本声明**不构成对任何具体行为合法性的保证或判断**。
 *
 * ## 十一、适用法律与争议解决
 *
 * 本声明的订立、效力、解释与履行适用**中华人民共和国法律**（不含冲突法规则）。因本声明或本项目产生的争议，双方应友好协商解决；协商不成的，提交作者住所地有管辖权的人民法院处理。
 *
 * ## 十二、生效与变更
 *
 * 1. 本声明自 2026 年 11 月 22 日起生效，适用于本项目 v5.5.0 及此后版本。
 * 2. 作者可能不时更新本声明。更新后的声明自发布之日起生效，并适用于发布时仍在使用本项目的用户。
 * 3. 本文引用的法律法规名称与条款，以发布时现行有效的文本为准；如相关法律修订，以修订后文本为准。
 *
 * ---
 *
 * **最后更新**：2026 年 11 月 23 日
 * **作者**：lead
 *
 * ---
 * ---
 *
 * # 附录 A：脚本内嵌的免责声明
 *
 * 自 `v5.5.0` 起，**完整免责声明已作为注释块内嵌**在 `douyin-ad-skipper.user.js` 的 `// ==/UserScript==` 元数据之后、立即执行函数之前。这意味着：
 *
 * - 即使脚本被单独转发、未附带本文件，内嵌文本仍构成完整声明；
 * - 内嵌版本与本文件内容一致，唯第八节（文件完整性）改为指向本文件，因为脚本无法在自己的注释里引用自身的哈希；
 * - 修改脚本时**不要删除该注释块**，否则将违反第七节关于不得删除声明的约定。
 *
 * 若需在其他场合引用精简版，可使用下面的摘要：
 *
 * ```javascript
 * /* ------------------------------------------------------------------
 *  * 抖音广告过滤脚本 v5.5.0 —— 免责声明（摘要）
 *  *
 *  * 1. 本项目仅供个人学习、研究与技术交流，禁止商业使用及任何违法用途。
 *  * 2. 本项目与抖音、字节跳动及其关联公司无任何关系，未获其授权或认可。
 *  * 3. 使用本脚本可能违反平台用户协议，可能导致账号被限制、封禁等后果；
 *  *    相关风险由使用者自行评估并承担，作者不承担任何责任。
 *  * 4. 本项目按"现状"提供，不作任何明示或默示担保，作者不对使用后果负责。
 *  * 5. 本版本不收集、不上传任何数据，配置仅保存在您本机浏览器。
 *  * 6. 如您不同意上述内容，请立即停止使用并删除本脚本。
 *  *
 *  * 完整免责声明见同目录 DISCLAIMER.md，其内容为本项目许可条件的组成部分。
 *  * 联系方式（仅用于权利通知与合规沟通）：luoxiashuang11@gmail.com
 *  * SHA-256: 【见 DISCLAIMER.md】
 *  * ------------------------------------------------------------------ * /
 * ```
 *
 * # 附录 B：群公告 / 网盘说明（纯文本版）
 *
 * 适合贴在聊天群公告、网盘分享说明、帖子正文等处，可整段复制：
 *
 * ```text
 * 【免责声明｜请务必阅读】
 *
 * 本脚本为个人学习研究作品，免费分享，仅供技术交流，禁止商业使用及任何违法用途。
 *
 * 1. 本脚本与抖音、字节跳动及其关联公司无任何关系，非官方产品，未获其授权或认可。
 * 2. 使用本脚本可能违反平台用户协议，存在账号被限制、封禁的风险，请自行评估并承担。
 * 3. 本版本不收集、不上传任何数据，所有配置仅保存在你本机浏览器，可随时清除。
 * 4. 脚本按"现状"提供，可能随平台改版失效，不保证可用性，作者不承担使用后果。
 * 5. 请勿使用来源不明的修改版；安装前建议核对文件哈希（见分享页说明）。
 *
 * 如不同意以上内容，请立即停止使用并删除本脚本。
 * 完整声明见 DISCLAIMER.md。
 * ```
 *
 * # 附录 C：发布前自查清单（作者自用，不必随脚本发布）
 *
 * - [x] 第九节的**联系方式**已填写为真实可用的渠道。
 * - [ ] 声明中的版本号、文件大小、行数、SHA-256 与本次发布的文件**完全一致**；每次发版后重新计算并更新。
 * - [ ] 发布前再次确认脚本内**没有**新增 `fetch` / `XMLHttpRequest` / `GM_xmlhttpRequest` / `sendBeacon` 等外联代码——一旦加入数据上报，第四节"不收集不上传"的表述即变成虚假陈述，风险显著上升。
 * - [ ] 已在脚本头部加入附录 A 的注释块。
 * - [ ] 分发页面的标题、封面、简介中**没有**"官方""破解""永久免费""内部版"等易引起误解的表述。
 * - [ ] 没有任何暗示与平台存在合作、授权、关联关系的文案、Logo 或图标。
 * - [ ] 没有设置付费下载、打赏解锁、引流到私域变现等安排。若确有此类安排，需重新评估法律风险——它与第二节"禁止商业使用"的定位直接冲突。
 * - [ ] 若打算改用 MIT 等标准开源许可证：请注意 MIT **允许商业使用**，与本声明第二节冲突。二者只能择一，或相应调整声明措辞。
 * - [ ] 已在测试账号环境完整运行一遍，确认不会误跳过正常内容。
 * - [ ] 转载页面保留本声明全文，未作删减或改写。
 * ============================================================ */

(function () {
    'use strict';

    /* ============================================================
     * 0. 配置与存储
     * ============================================================ */
    const KEYS = {
        pos: 'adskip.v2.pos',
        size: 'adskip.v2.size',
        opacity: 'adskip.v2.opacity',
        keywords: 'adskip.v2.keywords',
        enabled: 'adskip.v2.enabled',
        flipDirection: 'adskip.v2.flipDirection',
        giveUpOnFail: 'adskip.v2.giveUpOnFail',
        nextArrowDir: 'adskip.v2.nextArrowDir',
        detectDelay: 'adskip.v2.detectDelay',
        cooldown: 'adskip.v2.cooldown',
        stepWait: 'adskip.v2.stepWait',
        pollMs: 'adskip.v2.pollMs',
        elementRules: 'adskip.v2.elementRules',
        pickEnabled: 'adskip.v2.pickEnabled',
        scanFullPage: 'adskip.v2.scanFullPage',
        ignoreRightBar: 'adskip.v2.ignoreRightBar',
        keywordLimit: 'adskip.v2.keywordLimit',
        whitelistLimit: 'adskip.v2.whitelistLimit',
        showSkipToast: 'adskip.v2.showSkipToast',
        exemptNotOverrideAds: 'adskip.v2.exemptNotOverrideAds',
        maxPerMinute: 'adskip.v2.maxPerMinute',
        keywordEnabled: 'adskip.v2.keywordEnabled',
        whitelistEnabled: 'adskip.v2.whitelistEnabled',
        elementEnabled: 'adskip.v2.elementEnabled',
        adsEnabled: 'adskip.v2.adsEnabled',
        whitelist: 'adskip.v2.whitelist',
        panelW: 'adskip.v2.panelW',
        panelH: 'adskip.v2.panelH'
    };

    const LIMIT = {
        sizeMin: 8,
        sizeMax: 200,
        opacityMin: 1,
        opacityMax: 100
    };

    const DEFAULTS = {
        size: 40,
        opacity: 96,
        pos: { right: 16, bottom: 120 }
    };

    const CFG = {
        directionTtl: 45000,   // 用户方向记忆有效期
        maxAttempts: 3         // 同一条视频最多尝试几轮
    };

    function clampNum(v, min, max, def) {
        const n = parseInt(v, 10);
        if (isNaN(n)) return def;
        return Math.max(min, Math.min(max, n));
    }

    const store = {
        get(key, def) {
            try {
                if (typeof GM_getValue === 'function') {
                    const v = GM_getValue(key);
                    return v === undefined ? def : v;
                }
            } catch (e) { /* ignore */ }
            try {
                const raw = localStorage.getItem(key);
                return raw ? JSON.parse(raw) : def;
            } catch (e) { return def; }
        },
        set(key, val) {
            try {
                if (typeof GM_setValue === 'function') { GM_setValue(key, val); return; }
            } catch (e) { /* ignore */ }
            try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* ignore */ }
        },
        del(key) {
            try {
                if (typeof GM_deleteValue === 'function') { GM_deleteValue(key); return; }
            } catch (e) { /* ignore */ }
            try { localStorage.removeItem(key); } catch (e) { /* ignore */ }
        }
    };

    const state = {
        size: clampNum(store.get(KEYS.size, DEFAULTS.size), LIMIT.sizeMin, LIMIT.sizeMax, DEFAULTS.size),
        opacity: clampNum(store.get(KEYS.opacity, DEFAULTS.opacity), LIMIT.opacityMin, LIMIT.opacityMax, DEFAULTS.opacity),
        pos: store.get(KEYS.pos, null),
        keywords: [],
        keywordLimit: clampNum(store.get(KEYS.keywordLimit, 60), 1, 1000000, 60),
        whitelistLimit: clampNum(store.get(KEYS.whitelistLimit, 60), 1, 1000000, 60),
        showSkipToast: store.get(KEYS.showSkipToast, true),
        exemptNotOverrideAds: store.get(KEYS.exemptNotOverrideAds, false),
        // 三个独立开关：屏蔽标签 / 豁免标签 / 元素屏蔽
        keywordEnabled: store.get(KEYS.keywordEnabled, true),
        whitelistEnabled: store.get(KEYS.whitelistEnabled, true),
        elementEnabled: store.get(KEYS.elementEnabled, true),
        adsEnabled: store.get(KEYS.adsEnabled, true),
        maxPerMinute: clampNum(store.get(KEYS.maxPerMinute, 40), 1, 10000, 40),
        enabled: store.get(KEYS.enabled, true),
        flipDirection: store.get(KEYS.flipDirection, false),
        giveUpOnFail: store.get(KEYS.giveUpOnFail, true),
        // next-arrow 实际对应的方向：0 未校准，1 向下，-1 向上
        nextArrowDir: (function () {
            const v = parseInt(store.get(KEYS.nextArrowDir, 0), 10);
            return (v === 1 || v === -1) ? v : 0;
        })(),
        // 可调的节奏参数（毫秒）
        detectDelay: clampNum(store.get(KEYS.detectDelay, 200), 0, 600000, 200),
        cooldown: clampNum(store.get(KEYS.cooldown, 500), 0, 600000, 500),
        stepWait: clampNum(store.get(KEYS.stepWait, 700), 50, 600000, 700),
        pollMs: clampNum(store.get(KEYS.pollMs, 500), 50, 600000, 500),
        // 元素屏蔽规则
        elementRules: normalizeRules(store.get(KEYS.elementRules, [])),
        pickEnabled: store.get(KEYS.pickEnabled, true),
        // 扫描范围：true = 当前视口可见的所有内容，false = 只扫当前播放卡片
        scanFullPage: store.get(KEYS.scanFullPage, true),
        // 全页面扫描时豁免右侧互动栏（点赞/评论/收藏区），避免误判
        ignoreRightBar: store.get(KEYS.ignoreRightBar, true),
        // 二级层面板尺寸（0 表示高度自适应）
        panelW: clampNum(store.get(KEYS.panelW, 288), 200, 1200, 288),
        panelH: clampNum(store.get(KEYS.panelH, 0), 0, 4000, 0)
    };

    state.keywords = normalizeKeywords(store.get(KEYS.keywords, []), state.keywordLimit);
    state.whitelist = normalizeKeywords(store.get(KEYS.whitelist, []), state.whitelistLimit);

    /* ---------- 关键词联合匹配器：一次扫描命中所有词 ---------- */
    let keywordRegex = null;

    function escapeRegExp(s) {
        return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function rebuildKeywordMatcher() {
        const kws = state.keywords;
        if (!kws.length) {
            keywordRegex = null;
            return;
        }

        // 长词排前面，避免「护眼灯」被「护眼」抢先匹配
        const sorted = kws.slice().sort((a, b) => b.length - a.length);

        try {
            keywordRegex = new RegExp(sorted.map(escapeRegExp).join('|'), 'i');
        } catch (e) {
            keywordRegex = null;
        }
    }

    function matchKeyword(text) {
        if (!keywordRegex || !text) return null;
        const m = text.match(keywordRegex);
        return m ? m[0] : null;
    }

    /* ---------- 豁免词匹配器：命中则完全不做跳过 ---------- */
    let whitelistRegex = null;

    function rebuildWhitelistMatcher() {
        const kws = state.whitelist;
        if (!kws.length) {
            whitelistRegex = null;
            return;
        }
        const sorted = kws.slice().sort((a, b) => b.length - a.length);
        try {
            whitelistRegex = new RegExp(sorted.map(escapeRegExp).join('|'), 'i');
        } catch (e) {
            whitelistRegex = null;
        }
    }

    function matchWhitelist(text) {
        if (!whitelistRegex || !text) return null;
        const m = text.match(whitelistRegex);
        return m ? m[0] : null;
    }

    function normalizeRules(list) {
        if (!Array.isArray(list)) return [];
        return list.filter(r => r && (r.selector || r.text)).slice(-1000000);
    }

    function normalizeKeywords(list, limit) {
        if (!Array.isArray(list)) return [];
        const max = clampNum(limit, 1, 1000000, 60);
        const out = [];
        const seen = new Set();
        for (const item of list) {
            const k = String(item || '').trim();
            if (!k) continue;
            const low = k.toLowerCase();
            if (seen.has(low)) continue;
            seen.add(low);
            out.push(k);
        }
        return out.slice(0, max);
    }

    /* ============================================================
     * 1. 通用小工具
     * ============================================================ */
    let toastEl = null;
    let toastTimer = null;

    function toast(msg) {
        if (!document.body) return;
        if (!toastEl) {
            toastEl = document.createElement('div');
            toastEl.id = 'adskip-toast';
            document.body.appendChild(toastEl);
        }
        toastEl.textContent = msg;
        toastEl.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1800);
    }

    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, (c) => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[c]));
    }

    function isVisible(el) {
        try {
            const r = el.getBoundingClientRect();
            return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight;
        } catch (e) {
            return false;
        }
    }

    function normText(s) {
        return String(s || '').replace(/\s+/g, ' ').trim();
    }

    // 判断一个 class 是否稳定（哈希类名会随发版变化）
    function isStableClass(c) {
        if (!c || c.length < 3 || c.length > 40) return false;
        if (!/^[A-Za-z][A-Za-z0-9_-]*$/.test(c)) return false;
        if (c.includes('-') || c.includes('_')) return true;   // xgplayer-shop-anchor
        if (c === c.toLowerCase()) return true;                // account
        if (c === c.toUpperCase() && c.length <= 6) return false;
        return false;                                          // Gif5fFM4 这类视为哈希
    }

    /* ============================================================
     * 2. 当前播放的是哪一条
     * ============================================================ */
    // 元素在视口内的可见面积
    function viewportOverlap(el) {
        try {
            const r = el.getBoundingClientRect();
            const left = Math.max(0, r.left);
            const top = Math.max(0, r.top);
            const right = Math.min(window.innerWidth, r.right);
            const bottom = Math.min(window.innerHeight, r.bottom);
            if (right <= left || bottom <= top) return 0;
            return (right - left) * (bottom - top);
        } catch (e) {
            return 0;
        }
    }

    // 当前正在看的卡片：官方 active 标记可能瞬间消失，这里以"占视口面积最大"兜底
    let cachedCard = null;
    let cachedCardAt = 0;
    let liveSeq = 0;

    function getCurrentCard() {
        const now = Date.now();
        if (cachedCard && now - cachedCardAt < 120 && cachedCard && cachedCard.isConnected) {
            return cachedCard;
        }

        let best = null;
        let bestArea = 0;

        const active = document.querySelector('[data-e2e="feed-active-video"]');
        if (active) {
            const a = viewportOverlap(active);
            if (a > 0) {
                best = active;
                bestArea = a;
            }
        }

        const cards = document.querySelectorAll('[data-e2e-vid], [data-e2e="feed-live"]');
        for (const el of cards) {
            const area = viewportOverlap(el);
            if (area > bestArea) {
                bestArea = area;
                best = el;
            }
        }

        cachedCard = best;
        cachedCardAt = now;
        return best;
    }

    function getCurrentVid() {
        try {
            const params = new URL(location.href).searchParams;
            const modalId = params.get('modal_id') || params.get('vid') || params.get('aweme_id');
            if (modalId && /^\d+$/.test(modalId)) return modalId;
        } catch (e) { /* ignore */ }

        const m = location.pathname.match(/\/(?:video|note)\/(\d+)/);
        if (m) return m[1];

        const card = getCurrentCard();
        if (card) {
            const id = card.getAttribute('data-e2e-vid');
            if (id) return id;

            // 直播间没有 data-e2e-vid，用一个稳定的伪 id 参与去重
            const isLive = card.getAttribute('data-e2e') === 'feed-live'
                || (card.querySelector && !!card.querySelector('[data-e2e="feed-live"]'));

            if (isLive) {
                let key = null;
                try { key = card.getAttribute('data-dyadkey'); } catch (e) { /* ignore */ }

                if (!key) {
                    liveSeq++;
                    key = 'live:' + liveSeq;
                    try { card.setAttribute('data-dyadkey', key); } catch (e) { /* ignore */ }
                }
                return key;
            }
        }

        return '';
    }

    function getActiveScope() {
        return getCurrentCard() || document.body || document.documentElement;
    }

    /* ============================================================
     * 3. 判定：购物锚点 / 文本模式 / 用户关键词
     * ============================================================ */

    // 抖音播放器的购物锚点，类名稳定（xgplayer-shop-anchor）
    // 官方「广告」角标：作者信息行内那个 30×16 的 SVG（「广告」二字是 path 图形，
    // textContent 为空，只能靠结构识别）。普通视频的 .account 里没有这个 svg。
    function detectAdBadge(scope) {
        try {
            const acc = scope.querySelector('[data-e2e="video-info"] .account');
            if (!acc) return null;

            const svgs = acc.querySelectorAll('svg');
            for (const svg of svgs) {
                const w = svg.getAttribute('width');
                const h = svg.getAttribute('height');
                const vb = svg.getAttribute('viewBox');
                if ((w === '30' && h === '16') || vb === '0 0 30 16') return svg;
            }
        } catch (e) { /* ignore */ }
        return null;
    }

    function detectShopAnchor(scope) {
        const anchors = scope.querySelectorAll('.xgplayer-shop-anchor, [class*="shop-anchor"]');
        for (const el of anchors) {
            if (isVisible(el)) return el;
        }
        return null;
    }

    // 文本兜底：购物 + 分隔符，或「视频同款」等旧形态
    function detectShopText(scope) {
        const nodes = scope.querySelectorAll('div, span, p, a');
        for (const el of nodes) {
            if (el.children.length > 2) continue;
            const t = (el.textContent || '').replace(/\s+/g, '');
            if (!t || t.length > 46) continue;
            if (!isVisible(el)) continue;
            if (/^购物[|｜·]/.test(t)) return el;
            if (t.includes('视频同款')) return el;
            if (t.includes('购物') && t.includes('同款')) return el;
        }
        return null;
    }

    // 商品卡片形态：没有购物锚点，但播放器里出现「查看详情」这类按钮
    function detectProductCard(scope) {
        const btns = scope.querySelectorAll('button, [role="button"]');
        for (const el of btns) {
            const t = (el.textContent || '').replace(/\s+/g, '');
            if (!t || t.length > 12) continue;
            if (!/查看详情|查看商品|立即购买|去购买|马上抢/.test(t)) continue;
            if (isVisible(el)) return el;
        }
        return null;
    }

    // 用户关键词：在当前卡片的可见文本里找
    function detectKeyword(scope) {
        if (!state.keywords.length) return null;

        const parts = [];
        try {
            const desc = scope.querySelector('[data-e2e="video-desc"]');
            if (desc) parts.push(desc.textContent || '');
            const nick = scope.querySelector('[data-e2e="feed-video-nickname"]');
            if (nick) parts.push(nick.textContent || '');
        } catch (e) { /* ignore */ }

        parts.push(scope.textContent || '');

        const haystack = parts.join('\n').toLowerCase();
        for (const kw of state.keywords) {
            if (haystack.includes(kw.toLowerCase())) return kw;
        }
        return null;
    }

    // ---------- 元素屏蔽规则 ----------
    function makeRuleId() {
        return 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    }

    // 从被点中的元素提取尽量稳定的特征
    function buildElementRule(el) {
        if (!el || el.nodeType !== 1) return null;
        if (el === document.body || el === document.documentElement) return null;

        // 1) data-e2e 最稳，向上最多找 5 层
        let node = el;
        for (let i = 0; i < 5 && node && node !== document.body; i++) {
            const e2e = node.getAttribute && node.getAttribute('data-e2e');
            if (e2e) {
                return {
                    id: makeRuleId(),
                    selector: '[data-e2e="' + e2e + '"]',
                    text: '',
                    tag: node.tagName.toLowerCase(),
                    label: 'data-e2e: ' + e2e
                };
            }
            node = node.parentElement;
        }

        // 2) 稳定 class
        node = el;
        for (let i = 0; i < 5 && node && node !== document.body; i++) {
            const stable = Array.from(node.classList || []).filter(isStableClass);
            if (stable.length) {
                const tag = node.tagName.toLowerCase();
                const sel = tag + '.' + stable.join('.');
                return {
                    id: makeRuleId(),
                    selector: sel,
                    text: '',
                    tag: tag,
                    label: sel
                };
            }
            node = node.parentElement;
        }

        // 3) 文本兜底
        const text = normText(el.textContent);
        if (text && text.length <= 40) {
            return {
                id: makeRuleId(),
                selector: '',
                text: text,
                tag: el.tagName.toLowerCase(),
                label: '文本: ' + text
            };
        }

        return null;
    }

    // 从被右键的元素上取文字，加进屏蔽列表或豁免列表
    function addKeywordFromElement(el, mode) {
        if (!el || el.nodeType !== 1) return;

        const isExempt = mode === 'exempt';
        const list = isExempt ? state.whitelist : state.keywords;
        const cap = isExempt ? state.whitelistLimit : state.keywordLimit;
        const label = isExempt ? '豁免' : '屏蔽';

        let text = normText(el.textContent);

        // 元素本身没文字就往上找一层
        if (!text) {
            let node = el.parentElement;
            for (let i = 0; i < 3 && node && node !== document.body; i++) {
                text = normText(node.textContent);
                if (text) break;
                node = node.parentElement;
            }
        }

        text = text.replace(/^[#＃]+/, '').trim();

        if (!text) {
            toast('这个元素没有可取的文字');
            return;
        }
        if (text.length > 30) {
            text = text.slice(0, 30);
        }

        const exists = list.some(k => k.toLowerCase() === text.toLowerCase());
        if (exists) {
            toast('这个标签已在' + label + '列表里了：' + text);
            return;
        }

        if (list.length >= cap) {
            toast(label + '标签已达上限 ' + cap + ' 个');
            return;
        }

        // 新词插到最前面，保证添加后立刻能看到
        const next = normalizeKeywords([text].concat(list), cap);

        if (isExempt) {
            state.whitelist = next;
            store.set(KEYS.whitelist, state.whitelist);
            renderWhitelist();
        } else {
            state.keywords = next;
            store.set(KEYS.keywords, state.keywords);
            renderTags();
        }

        const offHint = isExempt
            ? (state.whitelistEnabled ? '' : '（豁免开关已关闭，暂时不生效）')
            : (state.keywordEnabled ? '' : '（屏蔽开关已关闭，暂时不生效）');
        toast('已' + label + '标签：' + text + offHint);
        check();
    }

    function addElementRule(target) {
        const rule = buildElementRule(target);
        if (!rule) {
            toast('这个元素识别不了，换个更具体的试试');
            return;
        }

        const exists = state.elementRules.some(r =>
            (r.selector && r.selector === rule.selector) ||
            (!r.selector && r.text && r.text === rule.text));

        if (exists) {
            toast('这个元素已经在屏蔽列表里了');
            return;
        }

        state.elementRules = state.elementRules.concat([rule]).slice(-1000000);
        store.set(KEYS.elementRules, state.elementRules);
        renderElementRules();
        toast('已添加元素屏蔽：' + rule.label + (state.elementEnabled ? '' : '（元素屏蔽开关已关闭，暂时不生效）'));
        check();
    }

    // 元素规则的合并匹配器：selector 合成一条，文本走 Map
    let mergedSelector = '';
    let textRuleMap = new Map();

    function detectElementRule(scope) {
        if (!state.elementRules.length) return null;

        // 1) 合并选择器：一次 querySelectorAll 覆盖所有 selector 规则
        if (mergedSelector) {
            try {
                const els = scope.querySelectorAll(mergedSelector);
                for (const el of els) {
                    if (!isVisible(el)) continue;
                    return findRuleByElement(el) || { id: 'merged', label: mergedSelector };
                }
            } catch (e) {
                // 合并失败（某条选择器语法有误），退回逐条查询
                for (const rule of state.elementRules) {
                    if (!rule.selector) continue;
                    try {
                        const els = scope.querySelectorAll(rule.selector);
                        for (const el of els) {
                            if (isVisible(el)) return rule;
                        }
                    } catch (err) { /* 单条失效，跳过 */ }
                }
            }
        }

        // 2) 文本规则：精确匹配走 Map，O(1)
        if (textRuleMap.size) {
            const nodes = scope.querySelectorAll('div, span, p, a, button');
            for (const el of nodes) {
                if (el.children.length > 2) continue;
                const rule = textRuleMap.get(normText(el.textContent));
                if (rule && isVisible(el)) return rule;
            }
        }

        return null;
    }

    // 命中的元素反查属于哪条规则（只在首个可见命中时调用一次）
    function findRuleByElement(el) {
        for (const rule of state.elementRules) {
            if (!rule.selector) continue;
            try {
                if (el.matches(rule.selector)) return rule;
            } catch (e) { /* ignore */ }
        }
        return null;
    }

    // 扫描范围：默认只扫当前卡片；开了「扫描全页面」就扫整个 body
    function getScanScope() {
        if (state.scanFullPage) return document.body || document.documentElement;
        return getCurrentCard() || document.body || document.documentElement;
    }

    function safeRect(el) {
        try {
            return el.getBoundingClientRect();
        } catch (e) {
            return null;
        }
    }

    // 收集可见文字：对完全在视口外的容器整棵剪掉，不再靠文本节点数量截断
    function collectVisibleText(root) {
        try {
            const parts = [];
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const stack = [root];

            let visited = 0;
            const VISIT_LIMIT = 20000;   // 极端页面的最后防线，正常页面远用不到

            while (stack.length && visited < VISIT_LIMIT) {
                const el = stack.pop();
                visited++;

                if (el.nodeType === 1) {
                    // 排除工具箱自身
                    if (el.closest && el.closest('#adskip-panel-wrap, #adskip-fab, #adskip-toast, .ad-pick-menu')) continue;

                    const r = safeRect(el);
                    if (!r) continue;

                    const zeroSize = (r.width === 0 && r.height === 0);

                    if (zeroSize) {
                        // 0×0 可能是 display:contents 包装层，不能整棵剪掉；
                        // 但如果连子节点都没有，就没必要继续
                        if (!el.firstElementChild) continue;
                    } else {
                        // 整体在视口之外：整棵子树跳过
                        if (r.bottom <= 0 || r.top >= vh || r.right <= 0 || r.left >= vw) continue;

                        // 右侧互动栏豁免
                        if (state.ignoreRightBar && r.left >= vw - 130) continue;
                    }
                }

                const children = el.childNodes;
                for (let i = 0; i < children.length; i++) {
                    const child = children[i];
                    if (child.nodeType === 3) {
                        const t = child.textContent;
                        if (t && t.trim()) parts.push(t);
                    } else if (child.nodeType === 1) {
                        stack.push(child);
                    }
                }
            }

            return parts.join(' ');
        } catch (e) {
            return '';
        }
    }

    // 对可见文本做统一判定：购物标记 / 商品卡按钮 / 关键词
    function detectTextRules(text) {
        if (!text) return null;

        const compact = text.replace(/\s+/g, '');

        // 广告文本特征受「广告屏蔽」开关控制
        if (state.adsEnabled) {
            if (/购物[|｜·]/.test(compact)) return { type: 'shop', detail: '广告：购物文本' };
            if (compact.includes('视频同款')) return { type: 'shop', detail: '广告：视频同款' };
            if (/查看详情|查看商品|立即购买|去购买|马上抢/.test(compact)) return { type: 'shop', detail: '广告：商品卡片' };
        }

        // 屏蔽标签开关关闭时，关键词不再参与判定
        if (state.keywordEnabled) {
            const kw = matchKeyword(text);
            if (kw) return { type: 'keyword', detail: '标签：' + kw };
        }

        return null;
    }

    // 可见文本短时缓存：check 里立即检测 + 延迟复核会连续调用两次，80ms 内复用
    let textCacheRoot = null;
    let textCacheAt = 0;
    let textCacheValue = '';

    function getVisibleText(scope) {
        const now = Date.now();
        if (textCacheRoot === scope && now - textCacheAt < 80) {
            return textCacheValue;
        }
        const text = collectVisibleText(scope);
        textCacheRoot = scope;
        textCacheAt = now;
        textCacheValue = text;
        return text;
    }

    // 综合判定，返回 { type, detail } 或 null
    function detectAd() {
        const scope = getScanScope();
        if (!scope) return null;

        let text = getVisibleText(scope);

        // 双保险：直接读当前卡片的标题与昵称。
        // 抖音大量使用 display:contents / 0×0 包装层，个别情况下标题文本没被
        // collectVisibleText 收进来，这里补一刀，确保标题一定参与匹配。
        try {
            const card = getCurrentCard();
            if (card) {
                const extra = [];
                const desc = card.querySelector('[data-e2e="video-desc"]');
                if (desc) extra.push(desc.textContent || '');
                const nick = card.querySelector('[data-e2e="feed-video-nickname"]');
                if (nick) extra.push(nick.textContent || '');
                if (extra.length) text = text + ' ' + extra.join(' ');
            }
        } catch (e) { /* ignore */ }

        // 豁免关键词优先级最高：命中就不再跳过。
        // 但开启「豁免不覆盖广告」后，若同时存在明确的广告结构（购物锚点 /
        // 购物文本 / 商品卡片按钮），则广告判定优先，豁免不再放行。
        // 豁免标签开关关闭时，整段豁免判定直接跳过。
        const exempt = state.whitelistEnabled ? matchWhitelist(text) : null;

        if (exempt) {
            if (state.exemptNotOverrideAds && state.adsEnabled) {
                if (detectShopAnchor(scope)) {
                    return { type: 'shop', detail: '广告：购物锚点（豁免不覆盖）' };
                }
                if (detectShopText(scope)) {
                    return { type: 'shop', detail: '广告：购物文本（豁免不覆盖）' };
                }
                if (detectProductCard(scope)) {
                    return { type: 'shop', detail: '广告：商品卡片（豁免不覆盖）' };
                }
            }
            return { type: 'exempt', detail: '豁免：' + exempt };
        }

        // 1) 用户自定义的元素规则（受「元素屏蔽」开关控制）
        if (state.elementEnabled) {
            const elemRule = detectElementRule(scope);
            if (elemRule) return { type: 'element', detail: '元素：' + elemRule.label };
        }

        // 2) 广告判定：官方角标 / 购物锚点（受「广告屏蔽」开关控制）
        if (state.adsEnabled) {
            if (detectAdBadge(scope)) {
                return { type: 'shop', detail: '广告：官方广告角标' };
            }
            if (detectShopAnchor(scope)) {
                return { type: 'shop', detail: '广告：购物锚点' };
            }
        }

        // 3) 可见文本综合判定（内部再按开关区分广告文本与关键词）
        return detectTextRules(text);
    }

    /* ============================================================
     * 4. 跳过动作
     * ============================================================ */
    let lastSkippedVid = '';
    let lastExemptVid = '';
    let lastSkippedAt = 0;
    let lastSkipAt = 0;
    let pendingTimer = null;
    let skipHistory = [];
    let totalSkipped = 0;

    // 运行状态，供面板实时展示
    const runtime = {
        checks: 0,
        lastCheckAt: 0,
        lastVid: '',
        lastResult: '等待检测',
        lastSkipResult: ''
    };

    /* ---------- 行为日志 ---------- */
    const logBuffer = [];
    const MAX_LOGS = 300;
    let currentTab = 'home';
    let logView = 'diag';
    let keywordFilter = '';
    let whitelistFilter = '';

    /* ---------- 可读日志：只记录跳过事件 ---------- */
    const readableLogs = [];

    function nowHM() {
        const d = new Date();
        return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    }

    function addReadable(action, reason, vid, kind) {
        readableLogs.push({
            time: nowHM(),
            action: action,
            reason: reason || '',
            vid: vid || '',
            kind: kind || ''
        });
        while (readableLogs.length > 300) readableLogs.shift();

        if (panelOpen && currentTab === 'logs' && logView === 'readable') renderLogs();
    }

    function readableTabFor(kind) {
        if (kind === 'keyword') return 'tags';
        if (kind === 'exempt') return 'whitelist';
        if (kind === 'element') return 'elements';
        return '';
    }

    function log(msg, level) {
        const entry = {
            t: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
            level: level || 'info',
            msg: String(msg)
        };
        logBuffer.push(entry);
        while (logBuffer.length > MAX_LOGS) logBuffer.shift();

        try {
            if (level === 'warn') console.warn('[广告过滤]', msg);
            else if (level === 'error') console.error('[广告过滤]', msg);
            else console.log('[广告过滤]', msg);
        } catch (e) { /* ignore */ }

        if (panelOpen && currentTab === 'logs') renderLogs();
    }

    function rateLimitOk() {
        const now = Date.now();
        skipHistory = skipHistory.filter(t => now - t < 60000);
        return skipHistory.length < state.maxPerMinute;
    }

    // ===== 用户方向：1 = 向下（下一条），-1 = 向上（上一条） =====
    let userDir = 0;
    let userDirAt = 0;

    function noteUserDirection(dir) {
        if (dir !== 1 && dir !== -1) return;
        userDir = dir;
        userDirAt = Date.now();
    }

    function currentDirection() {
        if (userDir && Date.now() - userDirAt < CFG.directionTtl) return userDir;
        return 1;   // 没记录就默认向下
    }

    // 只记录用户真实输入，脚本自己派发的事件 isTrusted 为 false，会被排除
    function bindDirectionWatch() {
        try {
            window.addEventListener('wheel', (e) => {
                if (!e.isTrusted) return;
                if (Math.abs(e.deltaY) < 2) return;
                noteUserDirection(e.deltaY > 0 ? 1 : -1);
            }, { passive: true, capture: true });
        } catch (e) { /* ignore */ }

        try {
            window.addEventListener('keydown', (e) => {
                if (!e.isTrusted) return;
                if (e.key === 'ArrowDown' || e.key === 'PageDown') noteUserDirection(1);
                else if (e.key === 'ArrowUp' || e.key === 'PageUp') noteUserDirection(-1);
            }, true);
        } catch (e) { /* ignore */ }

        // 触摸：手指上滑 = 下一条
        let touchY = null;
        window.addEventListener('touchstart', (e) => {
            if (!e.isTrusted || !e.touches || e.touches.length !== 1) return;
            touchY = e.touches[0].clientY;
        }, { passive: true, capture: true });

        window.addEventListener('touchmove', (e) => {
            if (!e.isTrusted || touchY == null || !e.touches || e.touches.length !== 1) return;
            const dy = e.touches[0].clientY - touchY;
            if (Math.abs(dy) > 12) noteUserDirection(dy < 0 ? 1 : -1);
        }, { passive: true, capture: true });

        window.addEventListener('touchend', () => { touchY = null; }, { passive: true });
    }

    // 完整鼠标事件序列，比 el.click() 更容易被播放器组件接受
    function realClick(el) {
        try {
            const r = el.getBoundingClientRect();
            const x = r.left + r.width / 2;
            const y = r.top + r.height / 2;
            const base = {
                bubbles: true,
                cancelable: true,
                composed: true,
                clientX: x,
                clientY: y,
                view: window,
                button: 0
            };
            el.dispatchEvent(new PointerEvent('pointerdown', Object.assign({}, base, { buttons: 1 })));
            el.dispatchEvent(new MouseEvent('mousedown', Object.assign({}, base, { buttons: 1 })));
            el.dispatchEvent(new PointerEvent('pointerup', base));
            el.dispatchEvent(new MouseEvent('mouseup', base));
            el.dispatchEvent(new MouseEvent('click', base));
            return true;
        } catch (e) {
            return false;
        }
    }

    // 滚轮一步，方向跟随用户
    function wheelStep(dir) {
        const scope = getActiveScope();
        const target = (scope && scope.nodeType === 1) ? scope : document.body;
        if (!target) return false;
        try {
            target.dispatchEvent(new WheelEvent('wheel', {
                deltaY: dir * 120,
                deltaMode: 0,
                bubbles: true,
                cancelable: true,
                composed: true
            }));
            return true;
        } catch (e) {
            return false;
        }
    }

    // 键盘一步，方向跟随用户
    function keyStep(dir) {
        const key = dir > 0 ? 'ArrowDown' : 'ArrowUp';
        const code = dir > 0 ? 40 : 38;
        const opts = {
            key: key,
            code: key,
            keyCode: code,
            which: code,
            bubbles: true,
            cancelable: true,
            composed: true
        };
        try { document.body.dispatchEvent(new KeyboardEvent('keydown', opts)); } catch (e) { /* ignore */ }
        try { document.dispatchEvent(new KeyboardEvent('keydown', opts)); } catch (e) { /* ignore */ }
        try { window.dispatchEvent(new KeyboardEvent('keydown', opts)); } catch (e) { /* ignore */ }
        return true;
    }

    // 官方翻页按钮：用原生 click（实测有效），并按校准结果挑方向
    let lastButtonUsed = '';

    function clickSwitchButton(dir) {
        let wantNext;

        if (state.nextArrowDir === 0) {
            wantNext = true;                                   // 未校准时先试 next
        } else {
            wantNext = (dir === state.nextArrowDir);           // next 对应的方向与目标一致才用 next
        }

        const sel = wantNext
            ? '[data-e2e="video-switch-next-arrow"]'
            : '[data-e2e="video-switch-prev-arrow"]';

        const btn = document.querySelector(sel);
        if (!btn) return false;

        lastButtonUsed = wantNext ? 'next' : 'prev';

        try {
            btn.click();
            return true;
        } catch (e) {
            return false;
        }
    }

    // 当前卡片在 feed 列表里的序号，用来判断是往上还是往下跳了
    function getActiveIndex() {
        const card = getCurrentCard();
        if (!card) return -1;
        try {
            const items = document.querySelectorAll('[data-e2e="feed-item"]');
            for (let i = 0; i < items.length; i++) {
                if (items[i].contains(card)) return i;
            }
        } catch (e) { /* ignore */ }
        return -1;
    }

    // ---------- 尝试跳过：一次只发一个动作，切走立刻停 ----------
    const skipAttempts = new Map();   // vid -> 已尝试轮数
    let skipping = false;

    function waitForChange(vid, timeout) {
        return new Promise((resolve) => {
            const start = Date.now();
            const tick = () => {
                if (getCurrentVid() !== vid) return resolve(true);
                if (Date.now() - start >= timeout) return resolve(false);
                setTimeout(tick, 80);
            };
            tick();
        });
    }

    async function trySkip(info, vid) {
        if (skipping) return;
        if (!info || info.type === 'exempt') return;   // 豁免永不跳过（双保险）

        const tried = skipAttempts.get(vid) || 0;
        if (state.giveUpOnFail && tried >= CFG.maxAttempts) return;

        skipping = true;
        skipAttempts.set(vid, tried + 1);
        lastSkipAt = Date.now();
        skipHistory.push(lastSkipAt);

        let dir = currentDirection();
        if (state.flipDirection) dir = -dir;   // 手动或自动纠偏后的方向
        const dirText = dir > 0 ? '向下' : '向上';

        log('尝试跳过 ' + vid + ' | ' + info.detail + ' | 方向: ' + dirText + ' | 第 ' + (tried + 1) + ' 轮');
        runtime.lastSkipResult = '尝试中';

        // 按钮方向是确定的，优先用它；滚轮/键盘作为兜底
        const steps = [
            { name: '翻页按钮 ' + dirText, run: () => clickSwitchButton(dir), isButton: true },
            { name: '翻页按钮重试', run: () => clickSwitchButton(dir), isButton: true },
            { name: '滚轮 ' + dirText, run: () => wheelStep(dir) },
            { name: '键盘 ' + (dir > 0 ? '↓' : '↑'), run: () => keyStep(dir) }
        ];

        const beforeIndex = getActiveIndex();

        try {
            for (const step of steps) {
                if (getCurrentVid() !== vid) break;

                const indexBeforeClick = getActiveIndex();

                let ok = false;
                try { ok = step.run() !== false; } catch (e) { ok = false; }
                if (!ok) {
                    log('方式不可用: ' + step.name);
                    continue;
                }

                const moved = await waitForChange(vid, state.stepWait);

                // 首次用 next 按钮成功后，顺手校准它对应的真实方向
                if (moved && step.isButton && state.nextArrowDir === 0 && lastButtonUsed === 'next') {
                    const idxAfter = getActiveIndex();
                    if (idxAfter >= 0 && indexBeforeClick >= 0 && idxAfter !== indexBeforeClick) {
                        state.nextArrowDir = idxAfter > indexBeforeClick ? 1 : -1;
                        store.set(KEYS.nextArrowDir, state.nextArrowDir);
                        log('校准 next-arrow 方向: ' + (state.nextArrowDir > 0 ? '向下' : '向上'));
                        toast('已校准翻页方向');
                    }
                }

                if (moved) break;

                // 超时但序号已经变了：说明动画正在进行，不要再补发下一个动作
                const idxNow = getActiveIndex();
                if (indexBeforeClick >= 0 && idxNow >= 0 && idxNow !== indexBeforeClick) {
                    log('检测到正在切换，停止补发');
                    break;
                }

                log('方式未生效: ' + step.name);
            }
        } finally {
            skipping = false;
        }

        const afterIndex = getActiveIndex();
        const vidChanged = getCurrentVid() !== vid;
        const indexMoved = beforeIndex >= 0 && afterIndex >= 0 && afterIndex !== beforeIndex;
        const directionOk = indexMoved
            ? ((dir > 0 && afterIndex > beforeIndex) || (dir < 0 && afterIndex < beforeIndex))
            : true;

        if (vidChanged && directionOk) {
            lastSkippedVid = vid;
            lastSkippedAt = Date.now();
            totalSkipped++;
            runtime.lastSkipResult = '成功';
            updateStat();
            log('跳过成功 | 累计: ' + totalSkipped + ' | index: ' + beforeIndex + '→' + afterIndex + ' | 方向: ' + dirText);
            addReadable('跳过', info.detail, vid, info.type);
            if (state.showSkipToast) toast('跳过 · ' + info.detail);
        } else if (vidChanged && !directionOk) {
            // 跳过去了但方向反了：只记录，不锁死
            runtime.lastSkipResult = '方向跳反（' + beforeIndex + '→' + afterIndex + '）';
            log('方向跳反: ' + beforeIndex + ' -> ' + afterIndex + ' 期望: ' + dirText, 'warn');
            addReadable('跳反', info.detail, vid, info.type);
        } else {
            runtime.lastSkipResult = '全部方式未生效';
            log('本轮未跳过: ' + vid, 'warn');
            addReadable('未跳过', info.detail, vid, info.type);
        }
    }

    function pruneAttempts() {
        if (skipAttempts.size > 200) skipAttempts.clear();
    }

    /* ============================================================
     * 5. 检测循环
     * ============================================================ */
    function check() {
        if (!state.enabled) {
            runtime.lastResult = '已暂停，未扫描';
            return;
        }

        runtime.checks++;
        runtime.lastCheckAt = Date.now();

        const vid = getCurrentVid();
        runtime.lastVid = vid;

        if (!vid) {
            runtime.lastResult = '等待视频加载';
            return;
        }

        const info = detectAd();

        if (!info) {
            runtime.lastResult = '未检测到广告';
            // 已经离开上次跳过的那条，解除锁定
            if (vid === lastSkippedVid) lastSkippedVid = '';
            return;
        }

        if (info.type === 'exempt') {
            runtime.lastResult = info.detail;
            // 同一条视频只记一次豁免日志
            if (vid !== lastExemptVid) {
                lastExemptVid = vid;
                addReadable('豁免', info.detail, vid, 'exempt');
            }
            return;
        }

        runtime.lastResult = info.detail;

        // 仍停在这条广告上，说明上次并没有真正跳走（跳反、被回退等），解除锁定重试
        if (vid === lastSkippedVid) {
            lastSkippedVid = '';
            skipAttempts.delete(vid);
            log('仍停留在上次跳过的视频，重新尝试: ' + vid);
        }

        if (state.giveUpOnFail && (skipAttempts.get(vid) || 0) >= CFG.maxAttempts) {
            runtime.lastResult = '这条已放弃（尝试 ' + CFG.maxAttempts + ' 轮）';
            return;
        }

        const cool = state.cooldown;
        if (Date.now() - lastSkipAt < cool) {
            runtime.lastResult = cool > 0 ? '冷却中（' + cool + 'ms）' : '冷却中';
            return;
        }

        if (!rateLimitOk()) {
            runtime.lastResult = '触发限流，暂停中';
            return;
        }

        clearTimeout(pendingTimer);
        pendingTimer = setTimeout(() => {
            if (!state.enabled) return;
            if (getCurrentVid() !== vid) return;
            if (vid === lastSkippedVid) return;
            const info2 = detectAd();
            if (!info2) return;
            if (info2.type === 'exempt') {          // 延迟期间命中豁免：放弃这次跳过
                runtime.lastResult = info2.detail;
                lastExemptVid = vid;
                return;
            }
            trySkip(info2, vid);
        }, state.detectDelay);
    }

    function loop() {
        check();
        pruneAttempts();
        setTimeout(loop, state.pollMs);
    }

    /* ============================================================
     * 6. 样式
     * ============================================================ */
    const CSS = `
        #adskip-fab {
            position: fixed;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 12px;
            border: 1px solid rgba(255,255,255,.1);
            background: linear-gradient(150deg, #2c2c33 0%, #1a1a1f 100%);
            color: #fff;
            cursor: pointer;
            user-select: none;
            -webkit-user-select: none;
            touch-action: none;
            z-index: 2147483647;
            box-shadow: 0 6px 22px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.06);
            transition: transform .16s ease, box-shadow .16s ease, border-color .16s ease;
            padding: 0;
        }
        #adskip-fab:hover {
            transform: scale(1.06);
            border-color: rgba(255,255,255,.22);
        }
        #adskip-fab.dragging { cursor: grabbing; transform: scale(1.03); }
        #adskip-fab.open {
            border-color: rgba(96,165,250,.6);
            box-shadow: 0 0 0 2px rgba(96,165,250,.25), 0 8px 26px rgba(0,0,0,.5);
        }
        #adskip-fab.paused { filter: grayscale(1); opacity: .55; }

        /* 过滤开启时：绿色内发光 */
        #adskip-fab::after {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: inherit;
            box-shadow: inset 0 0 0 1.5px rgba(74,222,128,.65),
                        inset 0 0 14px rgba(74,222,128,.28);
            opacity: 0;
            transition: opacity .25s ease;
            pointer-events: none;
        }
        #adskip-fab.on::after { opacity: 1; }

        #adskip-panel-wrap {
            position: fixed;
            z-index: 2147483646;
            visibility: hidden;
            pointer-events: none;
            width: 288px;
        }
        #adskip-panel-wrap.open { visibility: visible; pointer-events: auto; }

        #adskip-panel {
            width: 288px;
            box-sizing: border-box;
            position: relative;
            display: flex;
            flex-direction: column;
            background: rgba(22,22,26,.97);
            -webkit-backdrop-filter: blur(16px);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(255,255,255,.09);
            border-radius: 15px;
            box-shadow: 0 18px 50px rgba(0,0,0,.6);
            color: #e7e7ea;
            font: 13px/1.5 system-ui, -apple-system, "Microsoft YaHei", sans-serif;
            overflow: hidden;
            transform: scale(.96) translateY(6px);
            opacity: 0;
            transition: opacity .16s ease, transform .16s ease;
        }
        #adskip-panel-wrap.open #adskip-panel { opacity: 1; transform: none; }

        .ad-head {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 14px;
            border-bottom: 1px solid rgba(255,255,255,.06);
        }
        .ad-head b { font-size: 13px; font-weight: 600; }
        .ad-head .ad-stat { flex: 1; text-align: right; font-size: 11px; color: #7f7f89; }
        .ad-head .ad-close {
            background: none; border: 0; color: #8a8a94; font-size: 18px;
            cursor: pointer; line-height: 1; padding: 0 2px; border-radius: 4px;
        }
        .ad-head .ad-close:hover { color: #fff; }

        .ad-head .ad-mini-switch {
            flex: none;
            width: 34px;
            height: 20px;
            border-radius: 10px;
        }
        .ad-head .ad-mini-switch i {
            width: 16px;
            height: 16px;
        }
        .ad-head .ad-mini-switch.on i { transform: translateX(14px); }

        .ad-status {
            display: flex;
            align-items: center;
            gap: 7px;
            padding: 7px 14px;
            background: rgba(255,255,255,.025);
            border-bottom: 1px solid rgba(255,255,255,.05);
            font-size: 11px;
            color: #8b8b95;
            white-space: nowrap;
            overflow: hidden;
        }
        .ad-dot {
            flex: none;
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #6b6b75;
        }
        .ad-dot.on {
            background: #4ade80;
            box-shadow: 0 0 7px #4ade80;
        }
        .ad-s-state { flex: none; color: #c9c9d0; }
        .ad-s-dir {
            flex: none;
            color: #60a5fa;
            font-weight: 600;
            font-size: 12px;
            line-height: 1;
        }
        .ad-s-vid {
            flex: none;
            font-family: ui-monospace, Consolas, monospace;
            color: #7f7f89;
            font-size: 10px;
        }
        .ad-s-result {
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            color: #9a9aa4;
        }
        .ad-diag {
            flex: none;
            padding: 2px 8px;
            border-radius: 5px;
            border: 1px solid rgba(96,165,250,.35);
            background: rgba(37,99,235,.16);
            color: #93c5fd;
            font: 10px system-ui, sans-serif;
            cursor: pointer;
        }
        .ad-diag:hover { background: rgba(37,99,235,.3); }

        .ad-tabs {
            display: flex;
            gap: 4px;
            padding: 8px 10px 0;
        }
        .ad-tab {
            flex: 1;
            padding: 6px 0;
            border: 0;
            background: none;
            color: #87878f;
            font: 10px system-ui, sans-serif;
            cursor: pointer;
            border-bottom: 2px solid transparent;
            transition: color .15s ease, border-color .15s ease;
            white-space: nowrap;
        }
        .ad-tab:hover { color: #c9c9d0; }
        .ad-tab.active {
            color: #f0f0f2;
            border-bottom-color: #3b82f6;
        }

        /* 二级层：功能入口列表 */
        .ad-entry {
            display: flex;
            align-items: center;
            gap: 9px;
            padding: 9px 11px;
            border-radius: 9px;
            background: rgba(255,255,255,.04);
            border: 1px solid rgba(255,255,255,.06);
            cursor: pointer;
            transition: background .15s ease, border-color .15s ease;
        }
        .ad-entry:hover { background: rgba(255,255,255,.08); border-color: rgba(255,255,255,.11); }
        .ad-entry.no-nav { cursor: default; }
        .ad-entry.no-nav:hover { background: rgba(255,255,255,.04); border-color: rgba(255,255,255,.06); }
        .ad-entry-name { flex: none; font-size: 12px; color: #e2e2e8; }
        .ad-entry-count {
            flex: none;
            min-width: 16px;
            font-size: 10px;
            color: #7f7f89;
            font-family: ui-monospace, Consolas, monospace;
        }
        .ad-entry-desc { flex: 1; font-size: 10px; color: #6f6f78; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .ad-entry-arrow { flex: none; color: #6f6f78; font-size: 15px; line-height: 1; }

        /* 三级层：子页返回头 */
        .ad-sub-head {
            display: flex;
            align-items: center;
            gap: 6px;
            padding-bottom: 7px;
            border-bottom: 1px solid rgba(255,255,255,.06);
            flex: none;
        }
        .ad-back {
            background: none;
            border: 0;
            color: #93c5fd;
            font-size: 17px;
            cursor: pointer;
            padding: 0 5px;
            line-height: 1;
            border-radius: 5px;
        }
        .ad-back:hover { background: rgba(96,165,250,.16); }
        .ad-sub-head b { font-size: 12px; color: #d8d8de; font-weight: 600; }

        .ad-page { padding: 12px 14px 14px; display: flex; flex-direction: column; gap: 10px; flex: 1; overflow-y: auto; min-height: 0; }
        .ad-page[data-page="tags"],
        .ad-page[data-page="whitelist"],
        .ad-page[data-page="elements"],
        .ad-page[data-page="logs"] { overflow: hidden; }

        /* 对应开关关闭时，页面内容调暗，提示暂时不参与判定 */
        .ad-page.off .ad-input-row,
        .ad-page.off .ad-search,
        .ad-page.off .ad-tags-head,
        .ad-page.off .ad-tags,
        .ad-page.off .ad-elements,
        .ad-page.off .ad-tip { opacity: .45; }

        .ad-resize-handle {
            position: absolute;
            right: 0;
            bottom: 0;
            width: 18px;
            height: 18px;
            cursor: nwse-resize;
            z-index: 3;
            touch-action: none;
        }
        .ad-resize-handle::after {
            content: '';
            position: absolute;
            right: 3px;
            bottom: 3px;
            width: 8px;
            height: 8px;
            border-right: 2px solid rgba(255,255,255,.22);
            border-bottom: 2px solid rgba(255,255,255,.22);
            border-radius: 0 0 3px 0;
            transition: border-color .15s ease;
        }
        .ad-resize-handle:hover::after { border-color: rgba(96,165,250,.7); }

        .ad-input-row { display: flex; gap: 8px; }
        .ad-input {
            flex: 1;
            min-width: 0;
            padding: 7px 10px;
            border-radius: 8px;
            border: 1px solid rgba(255,255,255,.1);
            background: rgba(255,255,255,.05);
            color: #e8e8ec;
            font: 12px system-ui, sans-serif;
            outline: none;
        }
        .ad-input::placeholder { color: #6f6f78; }
        .ad-input:focus { border-color: rgba(96,165,250,.55); }
        .ad-add {
            flex: none;
            padding: 7px 14px;
            border-radius: 8px;
            border: 1px solid rgba(96,165,250,.4);
            background: rgba(37,99,235,.2);
            color: #93c5fd;
            font: 12px system-ui, sans-serif;
            cursor: pointer;
        }
        .ad-add:hover { background: rgba(37,99,235,.32); }

        .ad-search {
            width: 100%;
            box-sizing: border-box;
            padding: 5px 10px;
            border-radius: 7px;
            border: 1px solid rgba(255,255,255,.08);
            background: rgba(255,255,255,.04);
            color: #d8d8de;
            font: 11px system-ui, sans-serif;
            outline: none;
        }
        .ad-search::placeholder { color: #606069; }
        .ad-search:focus { border-color: rgba(96,165,250,.45); }

        .ad-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 7px;
            min-height: 52px;
            flex: 1;
            align-content: flex-start;
            overflow-y: auto;
        }
        .ad-tags-head {
            font-size: 10px;
            color: #6f6f78;
        }
        .ad-tags-head b {
            color: #b9b9c2;
            font-weight: 500;
        }
        .ad-tag {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            padding: 4px 8px 4px 10px;
            border-radius: 999px;
            background: rgba(239,68,68,.14);
            border: 1px solid rgba(248,113,113,.3);
            color: #fca5a5;
            font-size: 12px;
            max-width: 100%;
        }
        .ad-tag span {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            max-width: 180px;
        }
        .ad-tag i {
            font-style: normal;
            cursor: pointer;
            color: #f87171;
            font-size: 13px;
            line-height: 1;
            padding: 0 2px;
            border-radius: 50%;
        }
        .ad-tag i:hover { color: #fff; background: rgba(239,68,68,.55); }
        .ad-tag.flash {
            animation: adTagFlash 1.4s ease;
        }
        @keyframes adTagFlash {
            0%, 100% { box-shadow: none; }
            20% { box-shadow: 0 0 0 2px rgba(96,165,250,.9), 0 0 12px rgba(96,165,250,.6); }
            60% { box-shadow: 0 0 0 2px rgba(96,165,250,.6), 0 0 8px rgba(96,165,250,.35); }
        }
        .ad-tag.exempt {
            background: rgba(22,163,74,.14);
            border-color: rgba(74,222,128,.3);
            color: #86efac;
        }
        .ad-tag.exempt i { color: #4ade80; }
        .ad-tag.exempt i:hover { color: #fff; background: rgba(22,163,74,.55); }
        .ad-divider {
            height: 1px;
            background: rgba(255,255,255,.07);
            margin: 2px 0;
        }
        .ad-wl-tags { min-height: 52px; }
        .ad-empty { color: #6f6f78; font-size: 12px; padding: 8px 2px; }

        .ad-tip { font-size: 11px; color: #7a7a84; line-height: 1.7; }

        .ad-set-row { display: flex; align-items: center; gap: 7px; font-size: 12px; color: #9a9aa4; }
        .ad-set-row > span:first-child { width: 56px; flex: none; }
        .ad-num {
            width: 44px;
            padding: 4px 6px;
            border-radius: 6px;
            border: 1px solid rgba(255,255,255,.1);
            background: rgba(255,255,255,.05);
            color: #e8e8ec;
            font: 12px system-ui, sans-serif;
            text-align: right;
            outline: none;
            -moz-appearance: textfield;
            appearance: textfield;
        }
        .ad-num::-webkit-outer-spin-button,
        .ad-num::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .ad-range { flex: 1; min-width: 60px; }
        .ad-reset {
            margin-top: 2px;
            padding: 7px 0;
            border-radius: 8px;
            border: 1px solid rgba(255,255,255,.08);
            background: rgba(255,255,255,.05);
            color: #b9b9c2;
            font: 12px system-ui, sans-serif;
            cursor: pointer;
        }
        .ad-reset:hover { background: rgba(255,255,255,.1); color: #fff; }

        .ad-toggle-row {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;
            color: #9a9aa4;
            padding-top: 2px;
        }
        .ad-toggle-label {
            flex: 1;
            display: flex;
            flex-direction: column;
            line-height: 1.35;
        }
        .ad-toggle-label span {
            font-size: 10px;
            color: #6f6f78;
        }
        .ad-mini-switch {
            flex: none;
            width: 38px;
            height: 22px;
            border-radius: 11px;
            border: 0;
            background: #3a3a43;
            cursor: pointer;
            position: relative;
            transition: background .2s ease;
            padding: 0;
        }
        .ad-mini-switch i {
            position: absolute;
            top: 2px;
            left: 2px;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: #fff;
            transition: transform .2s ease;
            box-shadow: 0 1px 3px rgba(0,0,0,.3);
        }
        .ad-mini-switch.on { background: #16a34a; }
        .ad-mini-switch.on i { transform: translateX(16px); }

        .ad-hint {
            font-style: normal;
            font-size: 9px;
            color: #5f5f68;
            white-space: nowrap;
        }

        .ad-elements {
            display: flex;
            flex-direction: column;
            gap: 6px;
            flex: 1;
            min-height: 60px;
            overflow-y: auto;
        }
        .ad-elem-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 6px 9px;
            border-radius: 7px;
            background: rgba(255,255,255,.04);
            border: 1px solid rgba(255,255,255,.06);
            font-size: 11px;
            color: #c7c7cf;
        }
        .ad-elem-label {
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-family: ui-monospace, Consolas, monospace;
            font-size: 10px;
        }
        .ad-elem-item i {
            font-style: normal;
            cursor: pointer;
            color: #f87171;
            padding: 0 3px;
            border-radius: 50%;
        }
        .ad-elem-item i:hover { color: #fff; background: rgba(239,68,68,.5); }

        .ad-pick-menu {
            position: fixed;
            background: #1e1e23;
            border: 1px solid rgba(255,255,255,.12);
            border-radius: 9px;
            padding: 5px 0;
            box-shadow: 0 10px 30px rgba(0,0,0,.6);
            z-index: 2147483647;
            min-width: 168px;
            font: 12px system-ui, -apple-system, "Microsoft YaHei", sans-serif;
            color: #d8d8de;
        }
        .ad-pick-title {
            padding: 5px 12px 7px;
            font-size: 10px;
            color: #6f6f78;
            border-bottom: 1px solid rgba(255,255,255,.06);
            margin-bottom: 3px;
        }
        .ad-pick-item {
            padding: 7px 12px;
            cursor: pointer;
        }
        .ad-pick-item:hover { background: rgba(96,165,250,.18); }

        .ad-log-actions {
            display: flex;
            gap: 8px;
        }
        .ad-log-tabs {
            display: flex;
            gap: 6px;
        }
        .ad-log-tab {
            flex: 1;
            padding: 5px 0;
            border-radius: 6px;
            border: 1px solid rgba(255,255,255,.07);
            background: rgba(255,255,255,.03);
            color: #87878f;
            font: 11px system-ui, sans-serif;
            cursor: pointer;
        }
        .ad-log-tab.active {
            background: rgba(37,99,235,.18);
            border-color: rgba(96,165,250,.4);
            color: #93c5fd;
        }
        .ad-log-line.readable { color: #c7c7cf; }
        .ad-log-line.readable .ad-log-t { color: #6f8fb8; }
        .ad-log-actions button {
            flex: 1;
            padding: 6px 0;
            border-radius: 7px;
            border: 1px solid rgba(255,255,255,.09);
            background: rgba(255,255,255,.05);
            color: #c7c7cf;
            font: 11px system-ui, sans-serif;
            cursor: pointer;
        }
        .ad-log-actions button:hover { background: rgba(255,255,255,.11); color: #fff; }
        .ad-log-actions .ad-log-copy {
            border-color: rgba(96,165,250,.35);
            background: rgba(37,99,235,.16);
            color: #93c5fd;
        }
        .ad-logs {
            flex: 1;
            min-height: 80px;
            overflow-y: auto;
            font: 10px/1.55 ui-monospace, Consolas, monospace;
            background: rgba(0,0,0,.28);
            border-radius: 8px;
            padding: 8px;
            color: #9a9aa4;
        }
        .ad-log-line.nav { cursor: pointer; border-radius: 4px; }
        .ad-log-line.nav:hover { background: rgba(96,165,250,.14); }
        .ad-log-line {
            white-space: pre-wrap;
            word-break: break-all;
        }
        .ad-log-line .ad-log-t {
            color: #565660;
            margin-right: 6px;
        }
        .ad-log-line.warn { color: #fbbf24; }

        .ad-info {
            flex: none;
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: rgba(96,165,250,.18);
            border: 1px solid rgba(96,165,250,.4);
            color: #93c5fd;
            font: 600 9px/12px system-ui, sans-serif;
            text-align: center;
            cursor: help;
            user-select: none;
        }

        .ad-io-row {
            display: flex;
            gap: 8px;
            padding-top: 2px;
        }
        .ad-io-row button {
            flex: 1;
            padding: 7px 0;
            border-radius: 8px;
            border: 1px solid rgba(255,255,255,.08);
            background: rgba(255,255,255,.05);
            color: #b9b9c2;
            font: 11px system-ui, sans-serif;
            cursor: pointer;
        }
        .ad-io-row button:hover { background: rgba(255,255,255,.11); color: #fff; }

        #ad-import-mask {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,.6);
            z-index: 2147483647;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .ad-import-box {
            width: 360px;
            max-width: 90vw;
            background: #1c1c21;
            border: 1px solid rgba(255,255,255,.1);
            border-radius: 12px;
            padding: 14px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            font: 12px system-ui, -apple-system, "Microsoft YaHei", sans-serif;
            color: #e0e0e5;
            box-shadow: 0 18px 50px rgba(0,0,0,.6);
        }
        .ad-import-head { font-size: 13px; font-weight: 600; }
        .ad-import-text {
            width: 100%;
            height: 140px;
            resize: vertical;
            box-sizing: border-box;
            background: rgba(0,0,0,.3);
            border: 1px solid rgba(255,255,255,.1);
            border-radius: 8px;
            padding: 8px;
            color: #d0d0d8;
            font: 10px/1.5 ui-monospace, Consolas, monospace;
            outline: none;
        }
        .ad-import-actions { display: flex; gap: 8px; justify-content: flex-end; }
        .ad-import-actions button {
            padding: 6px 16px;
            border-radius: 7px;
            border: 1px solid rgba(255,255,255,.1);
            background: rgba(255,255,255,.06);
            color: #c7c7cf;
            font: 12px system-ui, sans-serif;
            cursor: pointer;
        }
        .ad-import-actions .ad-import-ok {
            background: #2563eb;
            border-color: #2563eb;
            color: #fff;
        }

        .ad-foot {
            padding: 0 14px 13px;
        }
        .ad-foot button {
            width: 100%;
            padding: 8px 0;
            border-radius: 9px;
            border: 1px solid rgba(255,255,255,.09);
            background: rgba(255,255,255,.05);
            color: #cfcfd6;
            font: 12px system-ui, sans-serif;
            cursor: pointer;
            transition: background .15s ease;
        }
        .ad-foot button:hover { background: rgba(255,255,255,.1); }
        .ad-foot button.paused {
            border-color: rgba(248,113,113,.35);
            background: rgba(239,68,68,.14);
            color: #fca5a5;
        }

        #adskip-toast {
            position: fixed;
            left: 50%;
            bottom: 96px;
            transform: translateX(-50%) translateY(6px);
            background: rgba(18,18,22,.94);
            color: #f2f2f4;
            border: 1px solid rgba(255,255,255,.08);
            padding: 8px 16px;
            border-radius: 9px;
            font: 12px/1.4 system-ui, sans-serif;
            z-index: 2147483647;
            pointer-events: none;
            opacity: 0;
            transition: opacity .18s ease, transform .18s ease;
            white-space: nowrap;
        }
        #adskip-toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
    `;

    function injectStyle() {
        let style = document.getElementById('adskip-style');
        if (!style) {
            style = document.createElement('style');
            style.id = 'adskip-style';
            document.head.appendChild(style);
        }
        style.textContent = CSS;
    }

    /* ============================================================
     * 7. 一级层：浮窗
     * ============================================================ */
    let fab = null;
    let panelWrap = null;
    let panelOpen = false;
    let statEl = null;

    function buildFab() {
        const old = document.getElementById('adskip-fab');
        if (old) old.remove();

        fab = document.createElement('button');
        fab.id = 'adskip-fab';
        fab.type = 'button';
        fab.innerHTML = '<span style="font-size:1em;line-height:1">🛒</span>';
        fab.title = '广告过滤（拖动移动，点击打开设置）';
        document.body.appendChild(fab);

        applySize(state.size);
        applyOpacity(state.opacity);
        applyPosition();
        bindFabDrag();
        syncEnabledUI();
    }

    function applySize(size) {
        state.size = clampNum(size, LIMIT.sizeMin, LIMIT.sizeMax, DEFAULTS.size);
        if (!fab) return;
        fab.style.width = state.size + 'px';
        fab.style.height = state.size + 'px';
        fab.style.borderRadius = Math.round(state.size * 0.27) + 'px';
        fab.style.fontSize = Math.round(state.size * 0.42) + 'px';
        if (panelOpen) positionPanel();
    }

    function applyOpacity(op) {
        state.opacity = clampNum(op, LIMIT.opacityMin, LIMIT.opacityMax, DEFAULTS.opacity);
        const v = String(state.opacity / 100);
        // 只作用于一级层浮窗，二级层面板始终保持不透明，方便操作
        if (fab) fab.style.setProperty('opacity', v, 'important');
    }

    function applyPosition() {
        if (!fab) return;
        if (state.pos && typeof state.pos.left === 'number' && typeof state.pos.top === 'number') {
            fab.style.left = state.pos.left + 'px';
            fab.style.top = state.pos.top + 'px';
            fab.style.right = 'auto';
            fab.style.bottom = 'auto';
            clampFab();
        } else {
            fab.style.left = 'auto';
            fab.style.top = 'auto';
            fab.style.right = DEFAULTS.pos.right + 'px';
            fab.style.bottom = DEFAULTS.pos.bottom + 'px';
        }
    }

    function clampFab() {
        if (!fab) return;
        const r = fab.getBoundingClientRect();
        if (!r.width) return;
        let left = r.left;
        let top = r.top;
        let changed = false;
        const maxLeft = window.innerWidth - r.width - 4;
        const maxTop = window.innerHeight - r.height - 4;
        if (left > maxLeft) { left = maxLeft; changed = true; }
        if (top > maxTop) { top = maxTop; changed = true; }
        if (left < 4) { left = 4; changed = true; }
        if (top < 4) { top = 4; changed = true; }
        if (changed) {
            fab.style.left = left + 'px';
            fab.style.top = top + 'px';
            fab.style.right = 'auto';
            fab.style.bottom = 'auto';
        }
    }

    function savePos() {
        if (!fab) return;
        const r = fab.getBoundingClientRect();
        state.pos = { left: Math.round(r.left), top: Math.round(r.top) };
        store.set(KEYS.pos, state.pos);
    }

    function bindFabDrag() {
        let down = null;
        let moved = false;
        let clickTimer = null;
        let lastTap = 0;

        fab.addEventListener('pointerdown', (e) => {
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            const r = fab.getBoundingClientRect();
            down = { x: e.clientX, y: e.clientY, left: r.left, top: r.top };
            moved = false;
            e.preventDefault();
        });

        document.addEventListener('pointermove', (e) => {
            if (!down) return;
            const dx = e.clientX - down.x;
            const dy = e.clientY - down.y;
            if (!moved && Math.hypot(dx, dy) < 6) return;

            moved = true;
            fab.classList.add('dragging');

            const maxLeft = window.innerWidth - fab.offsetWidth - 4;
            const maxTop = window.innerHeight - fab.offsetHeight - 4;
            const left = Math.max(4, Math.min(down.left + dx, maxLeft));
            const top = Math.max(4, Math.min(down.top + dy, maxTop));

            fab.style.left = left + 'px';
            fab.style.top = top + 'px';
            fab.style.right = 'auto';
            fab.style.bottom = 'auto';

            if (panelOpen) positionPanel();
        }, { passive: true });

        document.addEventListener('pointerup', () => {
            if (!down) return;
            const wasMoved = moved;
            down = null;
            moved = false;
            fab.classList.remove('dragging');

            if (wasMoved) {
                savePos();
                return;
            }

            // 双击 = 暂停/恢复过滤；单击 = 打开/关闭面板（延迟 260ms 以便区分双击）
            const now = Date.now();

            if (now - lastTap < 320) {
                lastTap = 0;
                if (clickTimer) { clearTimeout(clickTimer); clickTimer = null; }
                toggleEnabled();
                return;
            }

            lastTap = now;
            if (clickTimer) clearTimeout(clickTimer);
            clickTimer = setTimeout(() => {
                clickTimer = null;
                togglePanel();
            }, 260);
        });

        document.addEventListener('pointercancel', () => {
            down = null;
            moved = false;
            if (fab) fab.classList.remove('dragging');
        });

        // 点空白关闭面板
        document.addEventListener('pointerdown', (e) => {
            if (!panelOpen) return;
            if (panelWrap && panelWrap.contains(e.target)) return;
            if (fab && fab.contains(e.target)) return;
            closePanel();
        }, true);

        window.addEventListener('resize', () => {
            clampFab();
            if (panelOpen) positionPanel();
        });
    }

    /* ============================================================
     * 8. 二级层：面板（两个标签页）
     * ============================================================ */
    function buildPanel() {
        const old = document.getElementById('adskip-panel-wrap');
        if (old) old.remove();

        panelWrap = document.createElement('div');
        panelWrap.id = 'adskip-panel-wrap';
        panelWrap.innerHTML = `
            <div id="adskip-panel">
                <div class="ad-head">
                    <b>广告过滤</b>
                    <button class="ad-mini-switch ad-head-switch" type="button" role="switch" title="过滤开关"><i></i></button>
                    <span class="ad-stat">已跳过 0</span>
                    <button class="ad-close" type="button" title="关闭">×</button>
                </div>

                <div class="ad-status">
                    <span class="ad-dot"></span>
                    <span class="ad-s-state">运行中</span>
                    <span class="ad-s-dir" title="跳过方向">↓</span>
                    <span class="ad-s-vid"></span>
                    <span class="ad-s-result">等待检测</span>
                    <button class="ad-diag" type="button" title="复制当前页面诊断信息">诊断</button>
                </div>

                <div class="ad-page" data-page="home">
                    <div class="ad-entry" data-target="tags">
                        <span class="ad-entry-name">屏蔽标签</span>
                        <span class="ad-entry-count" data-count="kw">0</span>
                        <button class="ad-mini-switch ad-kw-on" type="button" role="switch"><i></i></button>
                        <span class="ad-entry-arrow">›</span>
                    </div>
                    <div class="ad-entry" data-target="whitelist">
                        <span class="ad-entry-name">豁免标签</span>
                        <span class="ad-entry-count" data-count="wl">0</span>
                        <button class="ad-mini-switch ad-wl-on" type="button" role="switch"><i></i></button>
                        <span class="ad-entry-arrow">›</span>
                    </div>
                    <div class="ad-entry" data-target="elements">
                        <span class="ad-entry-name">屏蔽元素</span>
                        <span class="ad-entry-count" data-count="elem">0</span>
                        <button class="ad-mini-switch ad-elem-on" type="button" role="switch"><i></i></button>
                        <span class="ad-entry-arrow">›</span>
                    </div>
                    <div class="ad-entry no-nav">
                        <span class="ad-entry-name">广告屏蔽</span>
                        <span class="ad-entry-desc">官方角标 / 购物锚点 / 商品卡</span>
                        <button class="ad-mini-switch ad-ads-on" type="button" role="switch"><i></i></button>
                    </div>
                    <div class="ad-entry" data-target="logs">
                        <span class="ad-entry-name">日志</span>
                        <span class="ad-entry-desc">跳过记录与诊断</span>
                        <span class="ad-entry-arrow">›</span>
                    </div>
                    <div class="ad-entry" data-target="settings">
                        <span class="ad-entry-name">设置</span>
                        <span class="ad-entry-desc">节奏参数 / 外观 / 导入导出</span>
                        <span class="ad-entry-arrow">›</span>
                    </div>
                </div>

                <div class="ad-page ad-sub" data-page="tags" hidden>
                    <div class="ad-sub-head">
                        <button class="ad-back" type="button" title="返回">‹</button>
                        <b>屏蔽标签</b>
                    </div>
                    <div class="ad-input-row">
                        <input class="ad-input" type="text" maxlength="40" placeholder="输入关键词，回车添加">
                        <button class="ad-add" type="button">添加</button>
                    </div>
                    <input class="ad-search ad-kw-search" type="text" placeholder="搜索已添加的屏蔽词…">
                    <div class="ad-tags-head">已添加 <b class="ad-tag-count">0 / 60</b>（新词在最前）</div>
                    <div class="ad-tags"></div>
                    <div class="ad-tip">当前视频的标题、作者或画面文案中出现任一关键词时，自动跳过。</div>
                </div>

                <div class="ad-page ad-sub" data-page="whitelist" hidden>
                    <div class="ad-sub-head">
                        <button class="ad-back" type="button" title="返回">‹</button>
                        <b>豁免标签</b>
                    </div>
                    <div class="ad-input-row">
                        <input class="ad-input ad-wl-input" type="text" maxlength="40" placeholder="豁免关键词，回车添加">
                        <button class="ad-add ad-wl-add" type="button">添加</button>
                    </div>
                    <input class="ad-search ad-wl-search" type="text" placeholder="搜索已添加的豁免词…">
                    <div class="ad-tags-head">已豁免 <b class="ad-wl-count">0 / 60</b></div>
                    <div class="ad-tags ad-wl-tags"></div>
                    <div class="ad-tip">命中任一豁免词时，这条视频不做任何跳过（优先级高于屏蔽词与元素规则）。</div>
                </div>

                <div class="ad-page ad-sub" data-page="elements" hidden>
                    <div class="ad-sub-head">
                        <button class="ad-back" type="button" title="返回">‹</button>
                        <b>屏蔽元素</b>
                    </div>
                    <div class="ad-tip">在页面上右键任意元素：选「屏蔽此标签文字」加入屏蔽标签，选「豁免此标签文字」加入豁免，选「屏蔽此元素」记成元素规则。</div>
                    <div class="ad-tags-head">已记录 <b class="ad-elem-count">0</b> 条规则（上限 100 万）</div>
                    <div class="ad-elements"></div>
                </div>

                <div class="ad-page ad-sub" data-page="logs" hidden>
                    <div class="ad-sub-head">
                        <button class="ad-back" type="button" title="返回">‹</button>
                        <b>日志</b>
                    </div>
                    <div class="ad-log-tabs">
                        <button class="ad-log-tab active" data-logview="diag" type="button">诊断日志</button>
                        <button class="ad-log-tab" data-logview="readable" type="button">可读日志</button>
                    </div>
                    <div class="ad-log-actions">
                        <button class="ad-log-copy" type="button">复制当前视图</button>
                        <button class="ad-log-clear" type="button">清空</button>
                    </div>
                    <div class="ad-logs"></div>
                </div>

                <div class="ad-page ad-sub" data-page="settings" hidden>
                    <div class="ad-sub-head">
                        <button class="ad-back" type="button" title="返回">‹</button>
                        <b>设置</b>
                    </div>
                    <div class="ad-set-row">
                        <span>浮窗大小</span>
                        <input class="ad-num ad-size-num" type="number"
                               min="${LIMIT.sizeMin}" max="${LIMIT.sizeMax}" step="1" value="${state.size}">
                        <span>px</span>
                        <em class="ad-hint">建议 36–64（8–200）</em>
                    </div>
                    <div class="ad-set-row">
                        <span>透明度</span>
                        <input class="ad-num ad-op-num" type="number"
                               min="${LIMIT.opacityMin}" max="${LIMIT.opacityMax}" step="1" value="${state.opacity}">
                        <span>%</span>
                        <input class="ad-range ad-op-range" type="range"
                               min="${LIMIT.opacityMin}" max="${LIMIT.opacityMax}" step="1" value="${state.opacity}">
                    </div>
                    <div class="ad-tip" style="font-size:10px">透明度建议 20–100（1–100，设为 1 几乎看不见）。所有数值可自由填写，括号内为技术边界。</div>
                    <button class="ad-reset" type="button">恢复默认（位置 / 大小 / 透明度）</button>

                    <div class="ad-toggle-row">
                        <span class="ad-toggle-label">方向反转<span>跳反了就打开</span></span>
                        <button class="ad-mini-switch ad-flip" type="button" role="switch"><i></i></button>
                    </div>
                    <div class="ad-toggle-row">
                        <span class="ad-toggle-label">失败后放弃<span>关掉则一直重试</span></span>
                        <button class="ad-mini-switch ad-giveup" type="button" role="switch"><i></i></button>
                    </div>
                    <div class="ad-toggle-row">
                        <span class="ad-toggle-label">右键选取元素<span>关闭后恢复浏览器右键</span></span>
                        <button class="ad-mini-switch ad-pick" type="button" role="switch"><i></i></button>
                    </div>
                    <div class="ad-toggle-row">
                        <span class="ad-toggle-label">扫描全页面<span>整页扫描会算上相邻预加载卡片</span></span>
                        <button class="ad-mini-switch ad-scanfull" type="button" role="switch"><i></i></button>
                    </div>
                    <div class="ad-toggle-row" style="padding-left:12px">
                        <span class="ad-toggle-label">右侧互动栏豁免<span>全页扫描时跳过右侧按钮区</span></span>
                        <button class="ad-mini-switch ad-ignorebar" type="button" role="switch"><i></i></button>
                    </div>
                    <div class="ad-toggle-row">
                        <span class="ad-toggle-label">跳过提示<span>跳过时弹出具体原因</span></span>
                        <button class="ad-mini-switch ad-skiptoast" type="button" role="switch"><i></i></button>
                    </div>
                    <div class="ad-toggle-row">
                        <span class="ad-toggle-label">豁免不覆盖广告<span>命中豁免词时，明确广告仍然跳过</span></span>
                        <button class="ad-mini-switch ad-exemptads" type="button" role="switch"><i></i></button>
                    </div>

                    <div class="ad-set-row">
                        <span>跳过延迟</span>
                        <input class="ad-num ad-delay-num" type="number"
                               min="0" max="600000" step="10" value="${state.detectDelay}">
                        <span>ms</span>
                        <em class="ad-hint">建议 100–300（0–60万）</em>
                    </div>
                    <div class="ad-set-row">
                        <span>冷却时长</span>
                        <input class="ad-num ad-cool-num" type="number"
                               min="0" max="600000" step="50" value="${state.cooldown}">
                        <span>ms</span>
                        <em class="ad-hint">建议 200–800（0–60万）</em>
                    </div>
                    <div class="ad-set-row">
                        <span>单步等待</span>
                        <input class="ad-num ad-step-num" type="number"
                               min="50" max="600000" step="50" value="${state.stepWait}">
                        <span>ms</span>
                        <em class="ad-hint">建议 400–1000（50–60万）</em>
                    </div>
                    <div class="ad-set-row">
                        <span>扫描间隔</span>
                        <input class="ad-num ad-poll-num" type="number"
                               min="50" max="600000" step="50" value="${state.pollMs}">
                        <span>ms</span>
                        <em class="ad-hint">建议 250–800（50–60万）</em>
                    </div>
                    <div class="ad-set-row">
                        <span>屏蔽词上限</span>
                        <input class="ad-num ad-kwlimit-num" type="number"
                               min="1" max="1000000" step="10" value="${state.keywordLimit}">
                        <span>个</span>
                        <span class="ad-info" title="关键词越多，每轮扫描要比较的文本越多，且误判概率会叠加（每个词都会独立命中页面文字）。建议 30–80 个；结构性特征请优先用「元素屏蔽」。">i</span>
                        <em class="ad-hint">建议 30–80（1–100万）</em>
                    </div>
                    <div class="ad-set-row">
                        <span>豁免词上限</span>
                        <input class="ad-num ad-wllimit-num" type="number"
                               min="1" max="1000000" step="10" value="${state.whitelistLimit}">
                        <span>个</span>
                        <em class="ad-hint">建议 20–60（1–100万）</em>
                    </div>
                    <div class="ad-set-row">
                        <span>每分钟上限</span>
                        <input class="ad-num ad-maxper-num" type="number"
                               min="1" max="10000" step="5" value="${state.maxPerMinute}">
                        <span>次</span>
                        <em class="ad-hint">建议 20–60（1–1万）</em>
                    </div>
                    <div class="ad-tip" style="font-size:10px">检测到广告后等待「跳过延迟」再跳；两次跳过之间至少间隔「冷却时长」；每次动作后最多等「单步等待」；「扫描间隔」是检测循环的频率。单步等待低于 400、扫描间隔低于 250 容易误判。</div>
                    <div class="ad-io-row">
                        <button class="ad-export" type="button">导出配置</button>
                        <button class="ad-import" type="button">导入配置</button>
                    </div>
                </div>

                <div class="ad-resize-handle" title="拖动调整面板大小"></div>
            </div>
        `;
        document.body.appendChild(panelWrap);

        statEl = panelWrap.querySelector('.ad-stat');

        panelWrap.querySelector('.ad-close').addEventListener('click', closePanel);

        // 二级层：功能入口 → 进入三级层
        panelWrap.querySelectorAll('.ad-entry[data-target]').forEach(entry => {
            entry.addEventListener('click', (e) => {
                if (e.target.closest('.ad-mini-switch')) return;   // 点开关不进入子页
                switchTab(entry.getAttribute('data-target'));
            });
        });

        // 三级层：返回二级层
        panelWrap.querySelectorAll('.ad-back').forEach(btn => {
            btn.addEventListener('click', () => switchTab('home'));
        });

        // 关键词
        const input = panelWrap.querySelector('.ad-input');
        const addBtn = panelWrap.querySelector('.ad-add');

        const submitKeyword = () => {
            const raw = input.value.trim();
            if (!raw) return;

            // 先判重（精确、大小写不敏感），避免把"被上限截断"误判成"已存在"
            const exists = state.keywords.some(k => k.toLowerCase() === raw.toLowerCase());
            if (exists) {
                locateTag('ad-tags', raw);
                return;
            }

            if (state.keywords.length >= state.keywordLimit) {
                toast('屏蔽标签已达上限 ' + state.keywordLimit + ' 个（可在设置中调高）');
                return;
            }

            // 新词插到最前面，保证添加后立刻能看到
            state.keywords = normalizeKeywords([raw].concat(state.keywords), state.keywordLimit);
            store.set(KEYS.keywords, state.keywords);
            input.value = '';
            renderTags();
            toast('已添加：' + raw);
        };

        addBtn.addEventListener('click', submitKeyword);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                submitKeyword();
            }
        });

        // 豁免关键词
        const wlInput = panelWrap.querySelector('.ad-wl-input');
        const wlAdd = panelWrap.querySelector('.ad-wl-add');

        const submitWhitelist = () => {
            const raw = wlInput.value.trim();
            if (!raw) return;

            const exists = state.whitelist.some(k => k.toLowerCase() === raw.toLowerCase());
            if (exists) {
                locateTag('ad-wl-tags', raw);
                return;
            }

            if (state.whitelist.length >= state.whitelistLimit) {
                toast('豁免标签已达上限 ' + state.whitelistLimit + ' 个（可在设置中调高）');
                return;
            }

            state.whitelist = normalizeKeywords([raw].concat(state.whitelist), state.whitelistLimit);
            store.set(KEYS.whitelist, state.whitelist);
            wlInput.value = '';
            renderWhitelist();
            toast('已豁免：' + raw);
        };

        if (wlAdd) wlAdd.addEventListener('click', submitWhitelist);
        if (wlInput) {
            wlInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    submitWhitelist();
                }
            });
        }

        // 黑白名单搜索
        const kwSearch = panelWrap.querySelector('.ad-kw-search');
        if (kwSearch) {
            kwSearch.addEventListener('input', () => {
                keywordFilter = kwSearch.value;
                renderTags();
            });
        }

        const wlSearch = panelWrap.querySelector('.ad-wl-search');
        if (wlSearch) {
            wlSearch.addEventListener('input', () => {
                whitelistFilter = wlSearch.value;
                renderWhitelist();
            });
        }

        // 设置：大小
        const sizeNum = panelWrap.querySelector('.ad-size-num');
        const sizeRange = panelWrap.querySelector('.ad-size-range');

        const applySizeFrom = (raw) => {
            const v = clampNum(raw, LIMIT.sizeMin, LIMIT.sizeMax, state.size);
            applySize(v);
            if (sizeNum) sizeNum.value = v;
            if (sizeRange) sizeRange.value = v;
        };

        if (sizeRange) {
            sizeRange.addEventListener('input', () => applySizeFrom(sizeRange.value));
            sizeRange.addEventListener('change', () => store.set(KEYS.size, state.size));
        }

        if (sizeNum) {
            sizeNum.addEventListener('input', () => {
                if (sizeNum.value !== '') applySizeFrom(sizeNum.value);
            });
            sizeNum.addEventListener('change', () => {
                applySizeFrom(sizeNum.value);
                store.set(KEYS.size, state.size);
            });
        }

        // 设置：透明度
        const opNum = panelWrap.querySelector('.ad-op-num');
        const opRange = panelWrap.querySelector('.ad-op-range');

        const applyOpFrom = (raw, fromRange) => {
            const v = clampNum(raw, LIMIT.opacityMin, LIMIT.opacityMax, state.opacity);
            applyOpacity(v);
            if (fromRange) opNum.value = v;
            else opRange.value = v;
        };
        opRange.addEventListener('input', () => applyOpFrom(opRange.value, true));
        opRange.addEventListener('change', () => store.set(KEYS.opacity, state.opacity));
        opNum.addEventListener('input', () => {
            if (opNum.value !== '') applyOpFrom(opNum.value, false);
        });
        opNum.addEventListener('change', () => {
            const v = clampNum(opNum.value, LIMIT.opacityMin, LIMIT.opacityMax, state.opacity);
            opNum.value = v;
            opRange.value = v;
            applyOpFrom(v, true);
            store.set(KEYS.opacity, state.opacity);
        });

        // 恢复默认
        panelWrap.querySelector('.ad-reset').addEventListener('click', () => {
            store.del(KEYS.pos);
            store.del(KEYS.size);
            store.del(KEYS.opacity);
            store.del(KEYS.detectDelay);
            store.del(KEYS.cooldown);
            store.del(KEYS.stepWait);
            store.del(KEYS.pollMs);
            store.del(KEYS.panelW);
            store.del(KEYS.panelH);
            store.del(KEYS.maxPerMinute);
            store.del(KEYS.exemptNotOverrideAds);
            store.del(KEYS.keywordEnabled);
            store.del(KEYS.whitelistEnabled);
            store.del(KEYS.elementEnabled);
            store.del(KEYS.adsEnabled);
            state.pos = null;
            state.size = DEFAULTS.size;
            state.opacity = DEFAULTS.opacity;
            state.detectDelay = 200;
            state.cooldown = 500;
            state.stepWait = 700;
            state.pollMs = 500;
            state.panelW = 288;
            state.panelH = 0;
            state.maxPerMinute = 40;
            state.exemptNotOverrideAds = false;
            state.keywordEnabled = true;
            state.whitelistEnabled = true;
            state.elementEnabled = true;
            state.adsEnabled = true;
            syncToggleUI();
            applyPanelSize();
            applySize(state.size);
            applyOpacity(state.opacity);
            applyPosition();
            sizeNum.value = state.size;
            sizeRange.value = state.size;
            opNum.value = state.opacity;
            opRange.value = state.opacity;
            const dn = panelWrap.querySelector('.ad-delay-num');
            const cn = panelWrap.querySelector('.ad-cool-num');
            const sn = panelWrap.querySelector('.ad-step-num');
            const pn = panelWrap.querySelector('.ad-poll-num');
            if (dn) dn.value = state.detectDelay;
            if (cn) cn.value = state.cooldown;
            if (sn) sn.value = state.stepWait;
            if (pn) pn.value = state.pollMs;
            toast('已恢复默认');
        });

        // 方向反转 / 失败放弃
        const flipBtn = panelWrap.querySelector('.ad-flip');
        if (flipBtn) {
            flipBtn.addEventListener('click', () => {
                state.flipDirection = !state.flipDirection;
                store.set(KEYS.flipDirection, state.flipDirection);
                syncToggleUI();
                toast(state.flipDirection ? '方向已反转' : '方向已恢复');
            });
        }

        const giveupBtn = panelWrap.querySelector('.ad-giveup');
        if (giveupBtn) {
            giveupBtn.addEventListener('click', () => {
                state.giveUpOnFail = !state.giveUpOnFail;
                store.set(KEYS.giveUpOnFail, state.giveUpOnFail);
                syncToggleUI();
                toast(state.giveUpOnFail ? '失败后放弃' : '失败后一直重试');
            });
        }

        const pickBtn = panelWrap.querySelector('.ad-pick');
        if (pickBtn) {
            pickBtn.addEventListener('click', () => {
                state.pickEnabled = !state.pickEnabled;
                store.set(KEYS.pickEnabled, state.pickEnabled);
                syncToggleUI();
                toast(state.pickEnabled ? '右键选取已开启' : '右键选取已关闭');
            });
        }

        const scanBtn = panelWrap.querySelector('.ad-scanfull');
        if (scanBtn) {
            scanBtn.addEventListener('click', () => {
                state.scanFullPage = !state.scanFullPage;
                store.set(KEYS.scanFullPage, state.scanFullPage);
                syncToggleUI();
                toast(state.scanFullPage ? '扫描范围：整个可见页面' : '扫描范围：当前视频卡片');
            });
        }

        const ignoreBarBtn = panelWrap.querySelector('.ad-ignorebar');
        if (ignoreBarBtn) {
            ignoreBarBtn.addEventListener('click', () => {
                state.ignoreRightBar = !state.ignoreRightBar;
                store.set(KEYS.ignoreRightBar, state.ignoreRightBar);
                syncToggleUI();
                toast(state.ignoreRightBar ? '右侧互动栏已豁免' : '右侧互动栏参与判定');
            });
        }

        // 跳过延迟 / 冷却时长
        const delayNum = panelWrap.querySelector('.ad-delay-num');
        if (delayNum) {
            delayNum.addEventListener('change', () => {
                const v = clampNum(delayNum.value, 0, 600000, state.detectDelay);
                delayNum.value = v;
                state.detectDelay = v;
                store.set(KEYS.detectDelay, v);
            });
        }

        const coolNum = panelWrap.querySelector('.ad-cool-num');
        if (coolNum) {
            coolNum.addEventListener('change', () => {
                const v = clampNum(coolNum.value, 0, 600000, state.cooldown);
                coolNum.value = v;
                state.cooldown = v;
                store.set(KEYS.cooldown, v);
            });
        }

        const stepNum = panelWrap.querySelector('.ad-step-num');
        if (stepNum) {
            stepNum.addEventListener('change', () => {
                const v = clampNum(stepNum.value, 50, 600000, state.stepWait);
                stepNum.value = v;
                state.stepWait = v;
                store.set(KEYS.stepWait, v);
            });
        }

        const pollNum = panelWrap.querySelector('.ad-poll-num');
        if (pollNum) {
            pollNum.addEventListener('change', () => {
                const v = clampNum(pollNum.value, 50, 600000, state.pollMs);
                pollNum.value = v;
                state.pollMs = v;
                store.set(KEYS.pollMs, v);
            });
        }

        // 屏蔽词上限
        const kwLimitNum = panelWrap.querySelector('.ad-kwlimit-num');
        if (kwLimitNum) {
            kwLimitNum.addEventListener('change', () => {
                const v = clampNum(kwLimitNum.value, 1, 1000000, state.keywordLimit);
                kwLimitNum.value = v;
                state.keywordLimit = v;
                store.set(KEYS.keywordLimit, v);

                if (state.keywords.length > v) {
                    state.keywords = state.keywords.slice(0, v);
                    store.set(KEYS.keywords, state.keywords);
                    toast('关键词已截断到 ' + v + ' 个');
                }
                renderTags();
            });
        }

        // 豁免词上限
        const wlLimitNum = panelWrap.querySelector('.ad-wllimit-num');
        if (wlLimitNum) {
            wlLimitNum.addEventListener('change', () => {
                const v = clampNum(wlLimitNum.value, 1, 1000000, state.whitelistLimit);
                wlLimitNum.value = v;
                state.whitelistLimit = v;
                store.set(KEYS.whitelistLimit, v);

                if (state.whitelist.length > v) {
                    state.whitelist = state.whitelist.slice(0, v);
                    store.set(KEYS.whitelist, state.whitelist);
                    toast('豁免词已截断到 ' + v + ' 个');
                }
                renderWhitelist();
            });
        }

        // 三个独立开关：屏蔽标签 / 豁免标签 / 元素屏蔽
        const kwOnBtn = panelWrap.querySelector('.ad-kw-on');
        if (kwOnBtn) {
            kwOnBtn.addEventListener('click', () => {
                state.keywordEnabled = !state.keywordEnabled;
                store.set(KEYS.keywordEnabled, state.keywordEnabled);
                syncToggleUI();
                toast(state.keywordEnabled ? '屏蔽标签已开启' : '屏蔽标签已关闭');
                check();
            });
        }

        const wlOnBtn = panelWrap.querySelector('.ad-wl-on');
        if (wlOnBtn) {
            wlOnBtn.addEventListener('click', () => {
                state.whitelistEnabled = !state.whitelistEnabled;
                store.set(KEYS.whitelistEnabled, state.whitelistEnabled);
                syncToggleUI();
                toast(state.whitelistEnabled ? '豁免标签已开启' : '豁免标签已关闭');
                check();
            });
        }

        const elemOnBtn = panelWrap.querySelector('.ad-elem-on');
        if (elemOnBtn) {
            elemOnBtn.addEventListener('click', () => {
                state.elementEnabled = !state.elementEnabled;
                store.set(KEYS.elementEnabled, state.elementEnabled);
                syncToggleUI();
                toast(state.elementEnabled ? '元素屏蔽已开启' : '元素屏蔽已关闭');
                check();
            });
        }

        const adsOnBtn = panelWrap.querySelector('.ad-ads-on');
        if (adsOnBtn) {
            adsOnBtn.addEventListener('click', () => {
                state.adsEnabled = !state.adsEnabled;
                store.set(KEYS.adsEnabled, state.adsEnabled);
                syncToggleUI();
                toast(state.adsEnabled ? '广告屏蔽已开启' : '广告屏蔽已关闭');
                check();
            });
        }

        // 跳过提示开关
        const skipToastBtn = panelWrap.querySelector('.ad-skiptoast');
        if (skipToastBtn) {
            skipToastBtn.addEventListener('click', () => {
                state.showSkipToast = !state.showSkipToast;
                store.set(KEYS.showSkipToast, state.showSkipToast);
                syncToggleUI();
                toast(state.showSkipToast ? '跳过时显示原因' : '跳过时不再提示');
            });
        }

        // 豁免不覆盖广告
        const exemptAdsBtn = panelWrap.querySelector('.ad-exemptads');
        if (exemptAdsBtn) {
            exemptAdsBtn.addEventListener('click', () => {
                state.exemptNotOverrideAds = !state.exemptNotOverrideAds;
                store.set(KEYS.exemptNotOverrideAds, state.exemptNotOverrideAds);
                syncToggleUI();
                toast(state.exemptNotOverrideAds
                    ? '豁免不再放行明确广告'
                    : '豁免重新优先（命中即放行）');
            });
        }

        // 每分钟尝试上限
        const maxPerNum = panelWrap.querySelector('.ad-maxper-num');
        if (maxPerNum) {
            maxPerNum.addEventListener('change', () => {
                const v = clampNum(maxPerNum.value, 1, 10000, state.maxPerMinute);
                maxPerNum.value = v;
                state.maxPerMinute = v;
                store.set(KEYS.maxPerMinute, v);
            });
        }

        // 配置导出 / 导入
        const exportBtn = panelWrap.querySelector('.ad-export');
        if (exportBtn) exportBtn.addEventListener('click', exportConfig);

        const importBtn = panelWrap.querySelector('.ad-import');
        if (importBtn) importBtn.addEventListener('click', openImportDialog);

        // 日志视图切换：诊断 / 可读
        const logTabs = panelWrap.querySelectorAll('.ad-log-tab');
        logTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                logView = tab.getAttribute('data-logview') || 'diag';
                logTabs.forEach(t => t.classList.toggle('active', t === tab));
                renderLogs();
            });
        });

        // 日志
        const logCopy = panelWrap.querySelector('.ad-log-copy');
        if (logCopy) {
            logCopy.addEventListener('click', () => {
                const text = buildLogText();
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(text)
                        .then(() => toast('日志已复制'))
                        .catch(() => {
                            console.log(text);
                            toast('复制失败，已打印到控制台');
                        });
                } else {
                    console.log(text);
                    toast('已打印到控制台');
                }
            });
        }

        const logClear = panelWrap.querySelector('.ad-log-clear');
        if (logClear) {
            logClear.addEventListener('click', () => {
                if (logView === 'readable') readableLogs.length = 0;
                else logBuffer.length = 0;
                renderLogs();
                toast('已清空当前视图');
            });
        }

        // 总开关（面板标题右侧的胶囊开关）
        const headSwitch = panelWrap.querySelector('.ad-head-switch');
        if (headSwitch) {
            headSwitch.addEventListener('click', () => toggleEnabled());
        }

        // 面板创建后再套一次透明度（避免创建早于设置）
        applyOpacity(state.opacity);

        // 诊断按钮：一键把页面关键状态复制到剪贴板
        const diagBtn = panelWrap.querySelector('.ad-diag');
        if (diagBtn) {
            diagBtn.addEventListener('click', () => {
                const data = collectDiag();
                const text = JSON.stringify(data, null, 2);
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(text)
                        .then(() => toast('诊断信息已复制'))
                        .catch(() => {
                            console.log('[广告过滤] 诊断信息:\n' + text);
                            toast('复制失败，已输出到控制台');
                        });
                } else {
                    console.log('[广告过滤] 诊断信息:\n' + text);
                    toast('已输出到控制台');
                }
            });
        }

        renderTags();
        renderWhitelist();
        renderElementRules();
        renderLogs();
        updateStat();
        syncEnabledUI();
        syncToggleUI();

        applyPanelSize();
        bindPanelResize();
    }

    function syncToggleUI() {
        const flip = panelWrap && panelWrap.querySelector('.ad-flip');
        const giveup = panelWrap && panelWrap.querySelector('.ad-giveup');
        const pick = panelWrap && panelWrap.querySelector('.ad-pick');
        const scan = panelWrap && panelWrap.querySelector('.ad-scanfull');
        const bar = panelWrap && panelWrap.querySelector('.ad-ignorebar');
        const skiptoast = panelWrap && panelWrap.querySelector('.ad-skiptoast');
        const exemptAds = panelWrap && panelWrap.querySelector('.ad-exemptads');
        const kwOn = panelWrap && panelWrap.querySelector('.ad-kw-on');
        const wlOn = panelWrap && panelWrap.querySelector('.ad-wl-on');
        const elemOn = panelWrap && panelWrap.querySelector('.ad-elem-on');
        const adsOn = panelWrap && panelWrap.querySelector('.ad-ads-on');
        if (flip) flip.classList.toggle('on', !!state.flipDirection);
        if (giveup) giveup.classList.toggle('on', !!state.giveUpOnFail);
        if (pick) pick.classList.toggle('on', !!state.pickEnabled);
        if (scan) scan.classList.toggle('on', !!state.scanFullPage);
        if (bar) bar.classList.toggle('on', !!state.ignoreRightBar);
        if (skiptoast) skiptoast.classList.toggle('on', !!state.showSkipToast);
        if (exemptAds) exemptAds.classList.toggle('on', !!state.exemptNotOverrideAds);
        if (kwOn) kwOn.classList.toggle('on', !!state.keywordEnabled);
        if (wlOn) wlOn.classList.toggle('on', !!state.whitelistEnabled);
        if (elemOn) elemOn.classList.toggle('on', !!state.elementEnabled);
        if (adsOn) adsOn.classList.toggle('on', !!state.adsEnabled);

        syncPageDim();
        updateEntryCounts();
    }

    // 刷新二级层入口上的数量
    function updateEntryCounts() {
        if (!panelWrap) return;
        const set = (key, val) => {
            const el = panelWrap.querySelector('.ad-entry-count[data-count="' + key + '"]');
            if (el) el.textContent = val;
        };
        set('kw', state.keywords.length);
        set('wl', state.whitelist.length);
        set('elem', state.elementRules.length);
    }

    // 开关关闭时把对应页面调暗，提示当前不参与判定
    function syncPageDim() {
        if (!panelWrap) return;
        [
            ['tags', state.keywordEnabled],
            ['whitelist', state.whitelistEnabled],
            ['elements', state.elementEnabled]
        ].forEach(([name, on]) => {
            const el = panelWrap.querySelector('.ad-page[data-page="' + name + '"]');
            if (el) el.classList.toggle('off', !on);
        });
    }

    // 元素规则的合并匹配器：selector 合成一条，文本走 Map
    function rebuildElementMatchers() {
        const sels = [];
        const seen = new Set();
        textRuleMap = new Map();

        for (const rule of state.elementRules) {
            if (rule.selector && !seen.has(rule.selector)) {
                seen.add(rule.selector);
                sels.push(rule.selector);
            }
            if (rule.text) {
                textRuleMap.set(normText(rule.text), rule);
            }
        }

        mergedSelector = sels.join(',');
    }

    function renderElementRules() {
        const box = panelWrap && panelWrap.querySelector('.ad-elements');
        if (!box) return;

        const countEl = panelWrap.querySelector('.ad-elem-count');
        if (countEl) countEl.textContent = state.elementRules.length;

        rebuildElementMatchers();

        box.innerHTML = '';

        if (!state.elementRules.length) {
            const empty = document.createElement('div');
            empty.className = 'ad-empty';
            empty.textContent = '暂无元素规则';
            box.appendChild(empty);
            return;
        }

        state.elementRules.forEach(rule => {
            const row = document.createElement('div');
            row.className = 'ad-elem-item';

            const label = document.createElement('span');
            label.className = 'ad-elem-label';
            label.textContent = rule.label || rule.selector || rule.text || '';
            label.title = label.textContent;

            const del = document.createElement('i');
            del.textContent = '×';
            del.title = '删除';
            del.addEventListener('click', () => {
                state.elementRules = state.elementRules.filter(r => r.id !== rule.id);
                store.set(KEYS.elementRules, state.elementRules);
                renderElementRules();
                toast('已移除元素规则');
            });

            row.appendChild(label);
            row.appendChild(del);
            box.appendChild(row);
        });

        updateEntryCounts();
    }

    // ---------- 右键选取元素 ----------
    let pickMenuEl = null;

    function onPickOutside(ev) {
        if (pickMenuEl && pickMenuEl.contains(ev.target)) return;
        closePickMenu();
    }

    function closePickMenu() {
        document.removeEventListener('pointerdown', onPickOutside, true);
        if (pickMenuEl) {
            pickMenuEl.remove();
            pickMenuEl = null;
        }
    }

    function showPickMenu(e) {
        closePickMenu();

        pickMenuEl = document.createElement('div');
        pickMenuEl.className = 'ad-pick-menu';
        pickMenuEl.innerHTML = `
            <div class="ad-pick-title">屏蔽 / 豁免</div>
            <div class="ad-pick-item" data-act="keyword">屏蔽此标签文字</div>
            <div class="ad-pick-item" data-act="exempt">豁免此标签文字</div>
            <div class="ad-pick-item" data-act="block">屏蔽此元素</div>
            <div class="ad-pick-item" data-act="cancel">取消</div>
        `;
        pickMenuEl.style.left = Math.min(e.clientX, window.innerWidth - 176) + 'px';
        pickMenuEl.style.top = Math.min(e.clientY, window.innerHeight - 180) + 'px';
        document.body.appendChild(pickMenuEl);

        const target = e.target;

        pickMenuEl.querySelectorAll('.ad-pick-item').forEach(item => {
            item.addEventListener('click', (ev) => {
                ev.stopPropagation();
                ev.preventDefault();
                const act = item.getAttribute('data-act');
                if (act === 'keyword') addKeywordFromElement(target, 'block');
                else if (act === 'exempt') addKeywordFromElement(target, 'exempt');
                else if (act === 'block') addElementRule(target);
                closePickMenu();
            });
        });

        setTimeout(() => {
            document.addEventListener('pointerdown', onPickOutside, true);
        }, 80);
    }

    function bindPickMenu() {
        document.addEventListener('contextmenu', (e) => {
            if (!state.pickEnabled) return;
            if (panelWrap && panelWrap.contains(e.target)) return;
            if (pickMenuEl && pickMenuEl.contains(e.target)) return;
            e.preventDefault();
            showPickMenu(e);
        }, true);
    }

    function renderLogs() {
        const box = panelWrap && panelWrap.querySelector('.ad-logs');
        if (!box) return;

        box.innerHTML = '';

        // 可读视图：只显示 时间 + 动作 + 原因 + 作品
        if (logView === 'readable') {
            if (!readableLogs.length) {
                box.innerHTML = '<div class="ad-empty">暂无跳过记录</div>';
                return;
            }

            const frag = document.createDocumentFragment();
            readableLogs.slice(-120).slice().reverse().forEach(r => {
                const line = document.createElement('div');
                line.className = 'ad-log-line readable';

                const t = document.createElement('span');
                t.className = 'ad-log-t';
                t.textContent = r.time;

                line.appendChild(t);
                line.appendChild(document.createTextNode(
                    r.action + '  ' + r.reason + (r.vid ? '  →  ' + r.vid : '')
                ));

                // 可点击跳到对应的标签 / 元素页
                const tab = readableTabFor(r.kind);
                if (tab) {
                    line.classList.add('nav');
                    line.title = '点击查看对应的' + (tab === 'tags' ? '屏蔽标签' : tab === 'whitelist' ? '豁免标签' : '元素规则');
                    line.addEventListener('click', () => switchTab(tab));
                }

                frag.appendChild(line);
            });
            box.appendChild(frag);
            return;
        }

        // 诊断视图
        if (!logBuffer.length) {
            box.innerHTML = '<div class="ad-empty">暂无诊断日志</div>';
            return;
        }

        const frag = document.createDocumentFragment();
        logBuffer.slice(-120).slice().reverse().forEach(l => {
            const line = document.createElement('div');
            line.className = 'ad-log-line' + (l.level === 'warn' ? ' warn' : '');

            const t = document.createElement('span');
            t.className = 'ad-log-t';
            t.textContent = l.t;

            line.appendChild(t);
            line.appendChild(document.createTextNode(l.msg));
            frag.appendChild(line);
        });

        box.innerHTML = '';
        box.appendChild(frag);
    }

    function buildLogText() {
        if (logView === 'readable') return buildReadableLogText();

        const ver = (function () {
            try {
                if (typeof GM_info === 'object' && GM_info && GM_info.script) return GM_info.script.version;
            } catch (e) { /* ignore */ }
            return '3.6.0';
        })();

        const head = [
            '抖音广告过滤 ' + ver,
            'URL: ' + location.href,
            '时间: ' + new Date().toLocaleString('zh-CN'),
            '状态: ' + (state.enabled ? '运行中' : '已暂停'),
            '方向: ' + (currentDirection() > 0 ? '向下' : '向上')
                + ' | 反转: ' + (state.flipDirection ? '开' : '关')
                + ' | nextArrowDir: ' + state.nextArrowDir,
            '设置: 延迟 ' + state.detectDelay + ' / 冷却 ' + state.cooldown
                + ' / 单步 ' + state.stepWait + ' / 扫描 ' + state.pollMs
                + ' / 每分钟上限 ' + state.maxPerMinute,
            '关键词: ' + (state.keywords.join('、') || '无'),
            '豁免词: ' + (state.whitelist.join('、') || '无'),
            '元素规则: ' + state.elementRules.length + ' 条',
            '扫描范围: ' + (state.scanFullPage ? '整页（含相邻卡片）' : '当前卡片（占视口最大）')
                + ' | 右侧互动栏: ' + (state.ignoreRightBar ? '豁免' : '参与'),
            '已跳过: ' + totalSkipped,
            '--- 日志 ---'
        ];

        return head.concat(logBuffer.map(l => l.t + '  ' + l.msg)).join('\n');
    }

    function buildReadableLogText() {
        const head = [
            '跳过记录（可读）',
            '时间: ' + new Date().toLocaleString('zh-CN'),
            '共 ' + readableLogs.length + ' 条',
            '---'
        ];
        const body = readableLogs.map(r =>
            r.time + '  ' + r.action + '  ' + r.reason + (r.vid ? '  →  ' + r.vid : ''));
        return head.concat(body).join('\n');
    }

    /* ---------- 配置导入导出 ---------- */
    function buildExportData() {
        return {
            app: 'douyin-ad-filter',
            version: (function () {
                try {
                    if (typeof GM_info === 'object' && GM_info && GM_info.script) return GM_info.script.version;
                } catch (e) { /* ignore */ }
                return '6.0.0';
            })(),
            exportedAt: new Date().toISOString(),
            data: {
                keywords: state.keywords.slice(),
                keywordLimit: state.keywordLimit,
                whitelist: state.whitelist.slice(),
                elementRules: state.elementRules.slice(),
                whitelistLimit: state.whitelistLimit,
                maxPerMinute: state.maxPerMinute,
                panelWidth: state.panelW,
                panelHeight: state.panelH,
                settings: {
                    detectDelay: state.detectDelay,
                    cooldown: state.cooldown,
                    stepWait: state.stepWait,
                    pollMs: state.pollMs,
                    size: state.size,
                    opacity: state.opacity
                },
                options: {
                    flipDirection: !!state.flipDirection,
                    giveUpOnFail: !!state.giveUpOnFail,
                    pickEnabled: !!state.pickEnabled,
                    scanFullPage: !!state.scanFullPage,
                    ignoreRightBar: !!state.ignoreRightBar,
                    nextArrowDir: state.nextArrowDir,
                    showSkipToast: !!state.showSkipToast,
                    exemptNotOverrideAds: !!state.exemptNotOverrideAds,
                    keywordEnabled: !!state.keywordEnabled,
                    whitelistEnabled: !!state.whitelistEnabled,
                    elementEnabled: !!state.elementEnabled,
                    adsEnabled: !!state.adsEnabled
                }
            }
        };
    }

    function exportConfig() {
        const text = JSON.stringify(buildExportData(), null, 2);

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).catch(() => { /* ignore */ });
        }

        try {
            const blob = new Blob([text], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'douyin-ad-filter-config.json';
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(a.href), 10000);
        } catch (e) { /* ignore */ }

        toast('配置已导出（已复制并下载 json）');
    }

    function applyImportData(obj) {
        if (!obj || obj.app !== 'douyin-ad-filter' || !obj.data) return '不是有效的配置文件';

        const d = obj.data;

        if (typeof d.keywordLimit === 'number') {
            state.keywordLimit = clampNum(d.keywordLimit, 1, 1000000, state.keywordLimit);
            store.set(KEYS.keywordLimit, state.keywordLimit);
        }
        if (typeof d.whitelistLimit === 'number') {
            state.whitelistLimit = clampNum(d.whitelistLimit, 1, 1000000, state.whitelistLimit);
            store.set(KEYS.whitelistLimit, state.whitelistLimit);
        }
        if (typeof d.maxPerMinute === 'number') {
            state.maxPerMinute = clampNum(d.maxPerMinute, 1, 10000, state.maxPerMinute);
            store.set(KEYS.maxPerMinute, state.maxPerMinute);
        }
        if (Array.isArray(d.keywords)) {
            state.keywords = normalizeKeywords(d.keywords, state.keywordLimit);
            store.set(KEYS.keywords, state.keywords);
        }
        if (Array.isArray(d.whitelist)) {
            state.whitelist = normalizeKeywords(d.whitelist, state.whitelistLimit);
            store.set(KEYS.whitelist, state.whitelist);
        }
        if (Array.isArray(d.elementRules)) {
            state.elementRules = normalizeRules(d.elementRules);
            store.set(KEYS.elementRules, state.elementRules);
        }
        if (typeof d.panelWidth === 'number') {
            state.panelW = clampNum(d.panelWidth, 200, 1200, state.panelW);
            store.set(KEYS.panelW, state.panelW);
        }
        if (typeof d.panelHeight === 'number') {
            state.panelH = clampNum(d.panelHeight, 0, 4000, state.panelH);
            store.set(KEYS.panelH, state.panelH);
        }

        const s = d.settings || {};
        if (typeof s.detectDelay === 'number') { state.detectDelay = clampNum(s.detectDelay, 0, 600000, state.detectDelay); store.set(KEYS.detectDelay, state.detectDelay); }
        if (typeof s.cooldown === 'number') { state.cooldown = clampNum(s.cooldown, 0, 600000, state.cooldown); store.set(KEYS.cooldown, state.cooldown); }
        if (typeof s.stepWait === 'number') { state.stepWait = clampNum(s.stepWait, 50, 600000, state.stepWait); store.set(KEYS.stepWait, state.stepWait); }
        if (typeof s.pollMs === 'number') { state.pollMs = clampNum(s.pollMs, 50, 600000, state.pollMs); store.set(KEYS.pollMs, state.pollMs); }
        if (typeof s.size === 'number') { state.size = clampNum(s.size, LIMIT.sizeMin, LIMIT.sizeMax, state.size); store.set(KEYS.size, state.size); }
        if (typeof s.opacity === 'number') { state.opacity = clampNum(s.opacity, LIMIT.opacityMin, LIMIT.opacityMax, state.opacity); store.set(KEYS.opacity, state.opacity); }

        const o = d.options || {};
        if (typeof o.flipDirection === 'boolean') { state.flipDirection = o.flipDirection; store.set(KEYS.flipDirection, state.flipDirection); }
        if (typeof o.giveUpOnFail === 'boolean') { state.giveUpOnFail = o.giveUpOnFail; store.set(KEYS.giveUpOnFail, state.giveUpOnFail); }
        if (typeof o.pickEnabled === 'boolean') { state.pickEnabled = o.pickEnabled; store.set(KEYS.pickEnabled, state.pickEnabled); }
        if (typeof o.scanFullPage === 'boolean') { state.scanFullPage = o.scanFullPage; store.set(KEYS.scanFullPage, state.scanFullPage); }
        if (typeof o.ignoreRightBar === 'boolean') { state.ignoreRightBar = o.ignoreRightBar; store.set(KEYS.ignoreRightBar, state.ignoreRightBar); }
        if (typeof o.showSkipToast === 'boolean') { state.showSkipToast = o.showSkipToast; store.set(KEYS.showSkipToast, state.showSkipToast); }
        if (typeof o.exemptNotOverrideAds === 'boolean') { state.exemptNotOverrideAds = o.exemptNotOverrideAds; store.set(KEYS.exemptNotOverrideAds, state.exemptNotOverrideAds); }
        if (typeof o.keywordEnabled === 'boolean') { state.keywordEnabled = o.keywordEnabled; store.set(KEYS.keywordEnabled, state.keywordEnabled); }
        if (typeof o.whitelistEnabled === 'boolean') { state.whitelistEnabled = o.whitelistEnabled; store.set(KEYS.whitelistEnabled, state.whitelistEnabled); }
        if (typeof o.elementEnabled === 'boolean') { state.elementEnabled = o.elementEnabled; store.set(KEYS.elementEnabled, state.elementEnabled); }
        if (typeof o.adsEnabled === 'boolean') { state.adsEnabled = o.adsEnabled; store.set(KEYS.adsEnabled, state.adsEnabled); }
        if (o.nextArrowDir === 1 || o.nextArrowDir === -1 || o.nextArrowDir === 0) {
            state.nextArrowDir = o.nextArrowDir;
            store.set(KEYS.nextArrowDir, state.nextArrowDir);
        }

        applySize(state.size);
        applyOpacity(state.opacity);
        applyPanelSize();
        renderTags();
        renderWhitelist();
        renderElementRules();
        syncToggleUI();
        syncSettingInputs();
        return '';
    }

    function syncSettingInputs() {
        if (!panelWrap) return;
        const set = (sel, val) => {
            const el = panelWrap.querySelector(sel);
            if (el) el.value = val;
        };
        set('.ad-size-num', state.size);
        set('.ad-size-range', state.size);
        set('.ad-op-num', state.opacity);
        set('.ad-op-range', state.opacity);
        set('.ad-delay-num', state.detectDelay);
        set('.ad-cool-num', state.cooldown);
        set('.ad-step-num', state.stepWait);
        set('.ad-poll-num', state.pollMs);
        set('.ad-kwlimit-num', state.keywordLimit);
        set('.ad-wllimit-num', state.whitelistLimit);
        set('.ad-maxper-num', state.maxPerMinute);
    }

    function closeImportDialog() {
        const el = document.getElementById('ad-import-mask');
        if (el) el.remove();
    }

    function openImportDialog() {
        closeImportDialog();

        const mask = document.createElement('div');
        mask.id = 'ad-import-mask';
        mask.innerHTML = `
            <div class="ad-import-box">
                <div class="ad-import-head">导入配置</div>
                <textarea class="ad-import-text" placeholder="粘贴导出的 JSON 内容"></textarea>
                <div class="ad-import-actions">
                    <button class="ad-import-cancel" type="button">取消</button>
                    <button class="ad-import-ok" type="button">导入</button>
                </div>
            </div>
        `;
        document.body.appendChild(mask);

        const ta = mask.querySelector('.ad-import-text');

        mask.querySelector('.ad-import-ok').addEventListener('click', () => {
            let obj = null;
            try {
                obj = JSON.parse(ta.value.trim());
            } catch (e) {
                obj = null;
            }

            const err = applyImportData(obj);
            if (err) {
                toast(err);
                return;
            }

            closeImportDialog();
            toast('配置已导入');
        });

        mask.querySelector('.ad-import-cancel').addEventListener('click', closeImportDialog);
        mask.addEventListener('click', (e) => {
            if (e.target === mask) closeImportDialog();
        });

        setTimeout(() => ta.focus(), 60);
    }

    function renderWhitelist() {
        rebuildWhitelistMatcher();

        const box = panelWrap && panelWrap.querySelector('.ad-wl-tags');
        if (!box) return;

        const countEl = panelWrap.querySelector('.ad-wl-count');
        const q = whitelistFilter.trim().toLowerCase();
        const list = q ? state.whitelist.filter(k => k.toLowerCase().includes(q)) : state.whitelist;

        if (countEl) {
            countEl.textContent = q
                ? '匹配 ' + list.length + ' / ' + state.whitelist.length
                : state.whitelist.length + ' / ' + state.whitelistLimit;
        }

        box.innerHTML = '';

        if (!state.whitelist.length) {
            const empty = document.createElement('div');
            empty.className = 'ad-empty';
            empty.textContent = '暂无豁免词（命中后不跳过）';
            box.appendChild(empty);
            box.scrollTop = 0;
            return;
        }

        if (!list.length) {
            const empty = document.createElement('div');
            empty.className = 'ad-empty';
            empty.textContent = '没有匹配的标签';
            box.appendChild(empty);
            box.scrollTop = 0;
            return;
        }

        list.forEach(kw => {
            const tag = document.createElement('span');
            tag.className = 'ad-tag exempt';

            const label = document.createElement('span');
            label.textContent = kw;
            label.title = kw;

            const del = document.createElement('i');
            del.textContent = '×';
            del.title = '删除';
            del.addEventListener('click', () => {
                state.whitelist = state.whitelist.filter(k => k !== kw);
                store.set(KEYS.whitelist, state.whitelist);
                renderWhitelist();
                toast('已移除豁免：' + kw);
            });

            tag.appendChild(label);
            tag.appendChild(del);
            box.appendChild(tag);
        });

        box.scrollTop = 0;
        updateEntryCounts();
    }

    // 关键词已存在时：清掉搜索过滤、滚动到该标签并高亮
    function locateTag(boxClass, kw) {
        if (!panelWrap) { toast('已存在：' + kw); return; }

        const isKw = boxClass === 'ad-tags';

        // 若搜索框有过滤，先清掉，否则标签可能不可见
        const searchSel = isKw ? '.ad-kw-search' : '.ad-wl-search';
        const searchEl = panelWrap.querySelector(searchSel);
        if (searchEl && searchEl.value) {
            searchEl.value = '';
            if (isKw) { keywordFilter = ''; renderTags(); }
            else { whitelistFilter = ''; renderWhitelist(); }
        }

        const box = panelWrap.querySelector('.' + boxClass);
        if (!box) { toast('已存在：' + kw); return; }

        const target = kw.trim().toLowerCase();
        const tags = box.querySelectorAll('.ad-tag');

        for (const tag of tags) {
            const label = tag.querySelector('span');
            if (!label) continue;
            if (label.textContent.trim().toLowerCase() !== target) continue;

            const top = tag.offsetTop - box.offsetTop;
            box.scrollTop = Math.max(0, top - 30);

            tag.classList.add('flash');
            setTimeout(() => tag.classList.remove('flash'), 1400);

            toast('已存在：' + kw + '（已定位）');
            return;
        }

        toast('已存在：' + kw);
    }

    function renderTags() {
        rebuildKeywordMatcher();

        const box = panelWrap && panelWrap.querySelector('.ad-tags');
        if (!box) return;

        const countEl = panelWrap.querySelector('.ad-tag-count');
        const q = keywordFilter.trim().toLowerCase();
        const list = q ? state.keywords.filter(k => k.toLowerCase().includes(q)) : state.keywords;

        if (countEl) {
            countEl.textContent = q
                ? '匹配 ' + list.length + ' / ' + state.keywords.length
                : state.keywords.length + ' / ' + state.keywordLimit;
        }

        box.innerHTML = '';

        if (!state.keywords.length) {
            const empty = document.createElement('div');
            empty.className = 'ad-empty';
            empty.textContent = '暂无屏蔽标签，先添加几个试试';
            box.appendChild(empty);
            box.scrollTop = 0;
            return;
        }

        if (!list.length) {
            const empty = document.createElement('div');
            empty.className = 'ad-empty';
            empty.textContent = '没有匹配的标签';
            box.appendChild(empty);
            box.scrollTop = 0;
            return;
        }

        list.forEach(kw => {
            const tag = document.createElement('span');
            tag.className = 'ad-tag';

            const label = document.createElement('span');
            label.textContent = kw;
            label.title = kw;

            const del = document.createElement('i');
            del.textContent = '×';
            del.title = '删除';
            del.addEventListener('click', () => {
                state.keywords = state.keywords.filter(k => k !== kw);
                store.set(KEYS.keywords, state.keywords);
                renderTags();
                toast('已移除：' + kw);
            });

            tag.appendChild(label);
            tag.appendChild(del);
            box.appendChild(tag);
        });

        // 新词在最前面，滚回顶部保证可见
        box.scrollTop = 0;
        updateEntryCounts();
    }

    function updateStat() {
        if (statEl) statEl.textContent = '已跳过 ' + totalSkipped;
    }

    // ---------- 面板内的实时扫描状态 ----------
    let statusTimer = null;

    function refreshStatus() {
        const box = panelWrap && panelWrap.querySelector('.ad-status');
        if (!box) return;

        const dot = box.querySelector('.ad-dot');
        const stateEl = box.querySelector('.ad-s-state');
        const vidEl = box.querySelector('.ad-s-vid');
        const resEl = box.querySelector('.ad-s-result');

        if (state.enabled) {
            dot.classList.add('on');
            stateEl.textContent = '运行中';
        } else {
            dot.classList.remove('on');
            stateEl.textContent = '已暂停';
        }

        vidEl.textContent = runtime.lastVid ? '…' + runtime.lastVid.slice(-6) : '—';
        resEl.textContent = runtime.lastResult || '等待检测';
        resEl.title = resEl.textContent;

        const dirEl = box.querySelector('.ad-s-dir');
        if (dirEl) {
            const d = currentDirection();
            dirEl.textContent = d > 0 ? '↓' : '↑';
            dirEl.title = d > 0 ? '跳过方向：向下（下一个）' : '跳过方向：向上（上一个）';
        }
    }

    function startStatusLoop() {
        refreshStatus();
        clearInterval(statusTimer);
        statusTimer = setInterval(refreshStatus, 400);
    }

    function stopStatusLoop() {
        clearInterval(statusTimer);
        statusTimer = null;
    }

    // ---------- 诊断信息 ----------
    function collectDiag() {
        const card = getCurrentCard();
        const anchor = document.querySelector('.xgplayer-shop-anchor');
        const nextBtn = document.querySelector('[data-e2e="video-switch-next-arrow"]');

        const rect = (el) => {
            if (!el) return null;
            const r = el.getBoundingClientRect();
            return {
                w: Math.round(r.width),
                h: Math.round(r.height),
                top: Math.round(r.top),
                left: Math.round(r.left)
            };
        };

        const visible = (el) => {
            if (!el) return false;
            const r = el.getBoundingClientRect();
            return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight;
        };

        let detected = null;
        try {
            const d = detectAd();
            detected = d ? { type: d.type, detail: d.detail } : null;
        } catch (e) {
            detected = { error: String(e && e.message || e) };
        }

        return {
            version: (function () {
                try {
                    if (typeof GM_info === 'object' && GM_info && GM_info.script) {
                        return GM_info.script.version;
                    }
                } catch (e) { /* ignore */ }
                return '6.0.0';
            })(),
            url: location.href,
            enabled: state.enabled,
            keywords: state.keywords.slice(),
            totalSkipped: totalSkipped,
            runtime: {
                checks: runtime.checks,
                lastResult: runtime.lastResult,
                lastVid: runtime.lastVid,
                lastSkipResult: runtime.lastSkipResult,
                lastSkipAgeMs: lastSkippedAt ? Date.now() - lastSkippedAt : null,
                lastSkippedVid: lastSkippedVid || null
            },
            direction: {
                lastUserDir: userDir,
                ageMs: userDirAt ? Date.now() - userDirAt : null,
                effective: (state.flipDirection ? -currentDirection() : currentDirection()) > 0 ? 'down' : 'up'
            },
            options: {
                flipDirection: !!state.flipDirection,
                giveUpOnFail: !!state.giveUpOnFail,
                nextArrowDir: state.nextArrowDir,
                pickEnabled: !!state.pickEnabled,
                scanFullPage: !!state.scanFullPage,
                keywordEnabled: !!state.keywordEnabled,
                whitelistEnabled: !!state.whitelistEnabled,
                elementEnabled: !!state.elementEnabled,
                adsEnabled: !!state.adsEnabled
            },
            elementRules: state.elementRules.map(r => r.label || r.selector || r.text),
            whitelist: state.whitelist.slice(),
            settings: {
                detectDelay: state.detectDelay,
                cooldown: state.cooldown,
                stepWait: state.stepWait,
                pollMs: state.pollMs,
                maxPerMinute: state.maxPerMinute,
                exemptNotOverrideAds: !!state.exemptNotOverrideAds
            },
            active: {
                found: !!card,
                vid: card ? card.getAttribute('data-e2e-vid') : null,
                index: getActiveIndex()
            },
            shopAnchor: {
                found: !!anchor,
                inActiveCard: !!(card && anchor && card.contains(anchor)),
                rect: rect(anchor),
                visible: visible(anchor),
                text: anchor ? (anchor.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80) : null
            },
            nextButton: {
                found: !!nextBtn,
                rect: rect(nextBtn),
                visible: visible(nextBtn)
            },
            detected: detected,
            visibleText: (function () {
                try {
                    const scope = getScanScope();
                    let t = getVisibleText(scope);

                    const card = getCurrentCard();
                    const descEl = card ? card.querySelector('[data-e2e="video-desc"]') : null;
                    const descText = descEl ? (descEl.textContent || '').trim() : '';

                    if (descText) t = t + ' ' + descText;

                    const kw = matchKeyword(t);
                    return {
                        length: t.length,
                        sample: t.slice(0, 160),
                        keywordHit: kw || null,
                        descText: descText.slice(0, 200)
                    };
                } catch (e) {
                    return null;
                }
            })()
        };
    }

    function toggleEnabled() {
        state.enabled = !state.enabled;
        store.set(KEYS.enabled, state.enabled);
        syncEnabledUI();
        toast(state.enabled ? '已恢复过滤' : '已暂停过滤');
    }

    function syncEnabledUI() {
        if (fab) {
            fab.classList.toggle('on', !!state.enabled);
            if (state.enabled) fab.classList.remove('paused');
            else fab.classList.add('paused');
        }

        const sw = panelWrap && panelWrap.querySelector('.ad-head-switch');
        if (sw) {
            sw.classList.toggle('on', !!state.enabled);
            sw.title = state.enabled ? '过滤运行中（点击暂停）' : '已暂停（点击恢复）';
        }
    }

    // 应用二级层面板尺寸（高度 0 表示自适应内容）
    function applyPanelSize() {
        const panelEl = panelWrap && panelWrap.querySelector('#adskip-panel');
        if (!panelEl) return;

        panelEl.style.width = state.panelW + 'px';
        panelWrap.style.width = state.panelW + 'px';

        if (state.panelH > 0) {
            panelEl.style.height = state.panelH + 'px';
        } else {
            panelEl.style.height = '';
        }
    }

    // 拖动右下角调整面板大小，松手后记忆
    function bindPanelResize() {
        if (!panelWrap) return;
        const handle = panelWrap.querySelector('.ad-resize-handle');
        const panelEl = panelWrap.querySelector('#adskip-panel');
        if (!handle || !panelEl) return;

        let start = null;

        handle.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const r = panelEl.getBoundingClientRect();
            start = { x: e.clientX, y: e.clientY, w: r.width, h: r.height };

            try { handle.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
        });

        handle.addEventListener('pointermove', (e) => {
            if (!start) return;

            const maxH = Math.max(260, window.innerHeight - 40);
            const w = clampNum(start.w + (e.clientX - start.x), 200, 1200, start.w);
            const h = clampNum(start.h + (e.clientY - start.y), 200, maxH, start.h);

            state.panelW = w;
            state.panelH = h;

            applyPanelSize();
            positionPanel();
        });

        handle.addEventListener('pointerup', () => {
            if (!start) return;
            start = null;
            store.set(KEYS.panelW, state.panelW);
            store.set(KEYS.panelH, state.panelH);
        });

        handle.addEventListener('pointercancel', () => {
            start = null;
        });
    }

    function positionPanel() {
        if (!fab || !panelWrap) return;
        const panelEl = panelWrap.querySelector('#adskip-panel');
        if (!panelEl) return;

        const pw = panelEl.offsetWidth || 288;
        const ph = panelEl.offsetHeight || 0;
        if (!ph) return;   // 还没完成布局，等下一帧再算

        const r = fab.getBoundingClientRect();
        const gap = 10;

        let left;
        if (r.right + gap + pw <= window.innerWidth - 8) {
            left = r.right + gap;
        } else if (r.left - gap - pw >= 8) {
            left = r.left - gap - pw;
        } else {
            left = Math.max(8, window.innerWidth - pw - 8);
        }

        let top = r.top;
        if (top + ph > window.innerHeight - 8) top = window.innerHeight - ph - 8;
        if (top < 8) top = 8;

        panelWrap.style.left = left + 'px';
        panelWrap.style.top = top + 'px';
    }

    function switchTab(name) {
        if (!panelWrap) return;
        currentTab = name;

        const pages = panelWrap.querySelectorAll('.ad-page');
        pages.forEach(p => {
            if (p.getAttribute('data-page') === name) p.removeAttribute('hidden');
            else p.setAttribute('hidden', '');
        });

        if (name === 'logs') renderLogs();
        if (name === 'home') updateEntryCounts();
    }

    function openPanel() {
        if (!panelWrap) buildPanel();
        panelOpen = true;
        if (fab) fab.classList.add('open');

        panelWrap.classList.add('open');
        panelWrap.style.setProperty('visibility', 'hidden', 'important');

        updateStat();
        renderTags();
        renderWhitelist();
        renderElementRules();
        if (currentTab === 'logs') renderLogs();
        syncEnabledUI();
        startStatusLoop();

        // 等一帧让布局稳定后再测量定位，避免刚打开时宽度和位置错乱
        requestAnimationFrame(() => {
            if (!panelOpen) return;
            positionPanel();
            panelWrap.style.setProperty('visibility', 'visible', 'important');
        });
    }

    function closePanel() {
        panelOpen = false;
        stopStatusLoop();
        if (fab) fab.classList.remove('open');
        if (panelWrap) {
            panelWrap.classList.remove('open');
            panelWrap.style.removeProperty('visibility');
        }
    }

    function togglePanel() {
        if (panelOpen) closePanel();
        else openPanel();
    }

    /* ============================================================
     * 9. 启动
     * ============================================================ */
    function init() {
        injectStyle();
        buildFab();
        buildPanel();
        bindDirectionWatch();
        bindPickMenu();

        // DOM 变化时检查（节流）
        let domTimer = null;
        try {
            const observer = new MutationObserver(() => {
                if (domTimer) return;
                domTimer = setTimeout(() => {
                    domTimer = null;
                    check();
                }, 180);
            });
            observer.observe(document.body, { childList: true, subtree: true, characterData: true });
        } catch (e) { /* ignore */ }

        loop();

        log('已加载 | 状态: ' + (state.enabled ? '开启' : '暂停') + ' | 关键词: ' + state.keywords.length + ' 个');
        log('判定: 购物锚点 / 商品卡片 / 关键词 → 翻页按钮 | nextArrowDir: ' + state.nextArrowDir);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }

})();
