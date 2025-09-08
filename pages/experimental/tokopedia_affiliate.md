// GENERATE AFFILIATE LINK REQUEST

curl 'https://gql.tokopedia.com/graphql/generateAffiliateLink' \
  -H 'sec-ch-ua-platform: "macOS"' \
  -H 'x-version: fd05378' \
  -H 'Referer: https://www.tokopedia.com/' \
  -H 'sec-ch-ua: "Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"' \
  -H 'x-price-center: true' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'bd-device-id: 7396874831050753554' \
  -H 'x-source: tokopedia-lite' \
  -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36' \
  -H 'accept: */*' \
  -H 'content-type: application/json' \
  -H 'x-tkpd-lite-service: zeus' \
  --data-raw $'[{"operationName":"generateAffiliateLink","variables":{"input":{"source":"sharing","channel":[18],"link":[{"Type":"pdp","URL":"https://www.tokopedia.com/rexus-official-shop/rexus-keyboard-office-membrane-k278-1729863171900279305","Identifier":"","IdentifierType":0,"AdditionalParams":[{"Key":"og_image_url","Value":""},{"Key":"og_title","Value":"Rexus Keyboard Office Membrane K278 - Hitam"},{"Key":"og_description","Value":"Dari Rexus Official Shop"}]}]}},"query":"mutation generateAffiliateLink($input: GenerateLinkRequest\u0021) {\\n  generateAffiliateLink(input: $input) {\\n    data: Data {\\n      status: Status\\n      type: Type\\n      error: Error\\n      identifier: Identifier\\n      identifierType: IdentifierType\\n      linkID: LinkID\\n      url: URL {\\n        shortURL: ShortURL\\n        regularURL: RegularURL\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n"}]'

// GENERATE AFFILIATE LINK REQUEST PAYLOAD

[
    {
        "operationName": "generateAffiliateLink",
        "variables": {
            "input": {
                "source": "sharing",
                "channel": [
                    18
                ],
                "link": [
                    {
                        "Type": "pdp",
                        "URL": "https://www.tokopedia.com/rexus-official-shop/rexus-keyboard-office-membrane-k278-1729863171900279305",
                        "Identifier": "",
                        "IdentifierType": 0,
                        "AdditionalParams": [
                            {
                                "Key": "og_image_url",
                                "Value": ""
                            },
                            {
                                "Key": "og_title",
                                "Value": "Rexus Keyboard Office Membrane K278 - Hitam"
                            },
                            {
                                "Key": "og_description",
                                "Value": "Dari Rexus Official Shop"
                            }
                        ]
                    }
                ]
            }
        },
        "query": "mutation generateAffiliateLink($input: GenerateLinkRequest!) {\\n  generateAffiliateLink(input: $input) {\\n    data: Data {\\n      status: Status\\n      type: Type\\n      error: Error\\n      identifier: Identifier\\n      identifierType: IdentifierType\\n      linkID: LinkID\\n      url: URL {\\n        shortURL: ShortURL\\n        regularURL: RegularURL\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n"
    }
]

// GENERATE AFFILIATE LINK RESPONSE

[
    {
        "data": {
            "generateAffiliateLink": {
                "data": [
                    {
                        "status": 1,
                        "type": "pdp",
                        "error": "",
                        "identifier": "100276292678",
                        "identifierType": 0,
                        "linkID": "556675507",
                        "url": {
                            "shortURL": "https://tk.tokopedia.com/ZSAEBma3r/",
                            "regularURL": "https://www.tokopedia.com/rexus-official-shop/rexus-keyboard-office-membrane-k278-1729863171900279305?aff_unique_id=VjgHAby2an_F8uF80KS8JN1lXnuEGXeHL0pG4cs5RkLMRO07VHGJ2dfNxxeNPMfWYJhTFDag\u0026channel=salinlink\u0026utm_source=salinlink\u0026utm_medium=affiliate-share\u0026utm_campaign=affiliateshare-pdp-VjgHAby2an_F8uF80KS8JN1lXnuEGXeHL0pG4cs5RkLMRO07VHGJ2dfNxxeNPMfWYJhTFDag-100276292678-0-080925\u0026scene=pdp\u0026chain_key=%7B%22t%22%3A1%2C%22k%22%3A%22000000000000000007547597071953807122%22%2C%22sc%22%3A%22salinlink%22%7D",
                            "__typename": "LinkData"
                        },
                        "__typename": "GenerateLinkDataResponse"
                    }
                ],
                "__typename": "GenerateLinkResponse"
            }
        }
    }
]
