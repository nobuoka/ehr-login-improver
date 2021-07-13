ehr-login-improver
==========

EHR (採用 Dr.) で特定の URL を開こうとしたときにログイン画面が表示されてしまうと、もともと表示したかった画面ではなくメニュー画面に遷移させられてしまうという辛い体験を解消するためのブラウザ拡張機能。

Firefox と Chrome で動作確認をしている。

## 仕様

* https://www.saiyo-dr.jp/ 配下の任意のページ (A) を開こうとして https://www.saiyo-dr.jp/{xxx}/login.jsp にリダイレクトされた場合に、本拡張機能が機能する (このパターンに当てはまらないログイン URL の場合には機能しない)
* 上記ログインページからログインして https://www.saiyo-dr.jp/{xxx}/menu.jsp に遷移させられそうになると、本拡張機能がもともと開こうとしていたページ (A) にリダイレクトする
    * ログイン後、https://www.saiyo-dr.jp/{xxx}/menu.jsp に遷移しない場合は、本拡張機能は機能しない

## 技術的な参考文献

* [初めての拡張機能 - MDN](https://developer.mozilla.org/ja/docs/Mozilla/Add-ons/WebExtensions/Your_first_WebExtension)
* [HTTP リクエストへの介入 - MDN](https://developer.mozilla.org/ja/docs/Mozilla/Add-ons/WebExtensions/Intercept_HTTP_requests)

## License

This project is published under the [MIT License](https://opensource.org/licenses/MIT).
