using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace LiveChatApi
{
    public class Chat
    {
        private IApiHandler Api;

        public Chat(IApiHandler api)
        {
            Api = api;
        }

        public class Session
        {
            public string secured_session_id { get; set; }
            public bool banned { get; set; }
        }

        public async Task<string> StartChat(string visitorID, string licenseID, string welcomeMessage, Dictionary<string, string> parameters = null)
        {
            string uri = string.Format("visitors/{0}/chat/start", HttpUtility.UrlEncode(visitorID));
            string content = string.Format("licence_id={0}&welcome_message={1}", HttpUtility.UrlEncode(licenseID), HttpUtility.UrlEncode(welcomeMessage));
            if (parameters != null && parameters.Count > 0)
            {
                foreach (var keyValuePair in parameters)
                {
                    content += string.Format("&{0}={1}", keyValuePair.Key, HttpUtility.UrlEncode(keyValuePair.Value));
                }
            }

            return await Api.Post(uri, content);
        }

        public async Task<string> TestChat(string visitorID, string licenseID, string welcomeMessage, Dictionary<string, string> parameters = null)
        {
            string uri = string.Format("visitors/{0}/chat/start", HttpUtility.UrlEncode(visitorID));
            string content = string.Format("licence_id={0}&welcome_message={1}", HttpUtility.UrlEncode(licenseID), HttpUtility.UrlEncode(welcomeMessage));
            if (parameters != null && parameters.Count > 0)
            {
                foreach (var keyValuePair in parameters)
                {
                    content += string.Format("&{0}={1}", keyValuePair.Key, HttpUtility.UrlEncode(keyValuePair.Value));
                }
            }

            string sessionID = await Api.Post(uri, content);
            Console.WriteLine("--------------------");
            Session ID = JsonConvert.DeserializeObject<Session>(sessionID);
            Console.WriteLine(ID.secured_session_id);
            Console.WriteLine("--------------------");

            //string uri2 = string.Format("visitors/{0}/chat/get_pending_messages?licence_id={1}&secured_session_id={2}", HttpUtility.UrlEncode(visitorID), HttpUtility.UrlEncode(licenseID), ID.secured_session_id);

            string message = "gua bales nih";
            string uri3 = string.Format("visitors/{0}/chat/send_message", HttpUtility.UrlEncode(visitorID));
            string content2 = string.Format("licence_id={0}&secured_session_id={1}&message={2}", HttpUtility.UrlEncode(licenseID), ID.secured_session_id, HttpUtility.UrlEncode(message));

            await Api.Post(uri3, content2);

            string message2 = "gua bales lagi";
            string uri4 = string.Format("visitors/{0}/chat/send_message", HttpUtility.UrlEncode(visitorID));
            string content3 = string.Format("licence_id={0}&secured_session_id={1}&message={2}", HttpUtility.UrlEncode(licenseID), ID.secured_session_id, HttpUtility.UrlEncode(message2));

            return await Api.Post(uri4, content3);
        }

        public async Task<string> GetPendingMessages(string visitorID, string licenseID, string sessionID, string lastMessageID = "")
        {
            string uri = string.Format("visitors/{0}/chat/get_pending_messages?licence_id={1}&secured_session_id={2}", HttpUtility.UrlEncode(visitorID), HttpUtility.UrlEncode(licenseID), HttpUtility.UrlEncode(sessionID));
            if (lastMessageID.Length > 0)
            {
                uri += string.Format("&last_message_id={0}", lastMessageID);
            }

            return await Api.Get(uri);
        }

        public async Task<string> SendMessage(string visitorID, string licenseID, string sessionID, string message)
        {
            string uri = string.Format("visitors/{0}/chat/send_message", HttpUtility.UrlEncode(visitorID));
            string content = string.Format("licence_id={0}&secured_session_id={1}&message={2}", HttpUtility.UrlEncode(licenseID), HttpUtility.UrlEncode(sessionID), HttpUtility.UrlEncode(message));

            return await Api.Post(uri, content);
        }

        public async Task<string> CloseChat(string visitorID, string licenseID, string sessionID)
        {
            string uri = string.Format("visitors/{0}/chat/close", HttpUtility.UrlEncode(visitorID));
            string content = string.Format("licence_id={0}&secured_session_id={1}", HttpUtility.UrlEncode(licenseID), HttpUtility.UrlEncode(sessionID));

            return await Api.Post(uri, content);
        }
    }
}
