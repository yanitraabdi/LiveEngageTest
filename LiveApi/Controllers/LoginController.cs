using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Web.Mvc;

namespace LiveApi.Controllers
{
    public class LoginController : Controller
    {
        // GET api/<controller>
        [HttpPost]
        public ActionResult TestAPI(string url, string method, string token, string body)
        {
            string json = "";
            try
            {
                var myUri = new Uri(url);
                var webReq = WebRequest.Create(myUri);
                var httpWebReq = (HttpWebRequest)webReq;
                httpWebReq.PreAuthenticate = true;
                if (!string.IsNullOrEmpty(token))
                    httpWebReq.Headers.Add("Authorization", "Bearer " + token);
                httpWebReq.ContentType = "application/json";
                httpWebReq.Accept = "application/json";
                httpWebReq.Method = method;
                if (!string.IsNullOrEmpty(body))
                {
                    using (var streamWriter = new StreamWriter(httpWebReq.GetRequestStream()))
                    {
                        streamWriter.Write(body);
                        streamWriter.Flush();
                        streamWriter.Close();
                    }
                }

                var webRes = webReq.GetResponse();
                var responseStream = webRes.GetResponseStream();
                if (responseStream == null) return null;

                var myStreamReader = new StreamReader(responseStream, Encoding.Default);
                json = myStreamReader.ReadToEnd();

                responseStream.Close();
                webRes.Close();
            }
            catch (Exception ex)
            {
                json = ex.Message;
            }
            return Json(json, JsonRequestBehavior.AllowGet);
        }
    }
}